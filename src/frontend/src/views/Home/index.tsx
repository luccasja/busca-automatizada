import React, { CSSProperties, useState } from "react";
import { Alert, ProgressBar, Table, Row, Col, Container, Button } from "react-bootstrap";
import { useToasts } from 'react-toast-notifications';
import Badge from '@material-ui/core/Badge';
import Api from "../../services/Api";
import NavBarCustom from "../../components/NavBarCustom";
import ResultadoModal from "../../components/ResultadoModal";
import "./styles.css";

export interface listaResponseType {
    lista: [responseType]
}

export interface responseType {
    resultado: resultadoType
}

export interface resultadoType {
    chassi: string;
    placa: string;
    renavam: string;
    situacao: string;
    motor: string;
    alvo: boolean;
    condicaoBusca: string;
    dataBusca: string;
    posicao: number;
}

function Home() {
    const [lista, setLista] = useState<resultadoType[]>([]);
    const [qntConsultas, setQntConsultas] = useState<number>(1);
    const [posicaoConsultaAtual, setPosicaoConsultaAtual] = useState<number>(0);
    const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
    const [motor, setMotor] = useState<string>("");
    const [chassi, setChassi] = useState<string>("");
    const [condicaoDaBusca, setCondicaoDaBusca] = useState<string>("");
    const [condicaoNumericaDaBusca, setCondicaoNumericaDaBusca] = useState<string>("0");
    const [disabilitarCampos, setDesabilitarCampos] = useState<boolean>(false);
    const [ocupado, setOcupado] = useState<boolean>(false);
    const [showModalResultado, setShowModalResultado] = useState<boolean>(false);
    const [atualizarResultados, setAtualizarResultados]= useState<boolean>(false);
    const [qntResultados, setQntResultados]= useState<number>(0);
    const continuarConsultaRef = React.createRef<HTMLDivElement>();
    const btnIniciarBuscasRef = React.createRef<HTMLButtonElement>();
    const btnPararBuscasRef = React.createRef<HTMLButtonElement>();
    const btnLimparRef = React.createRef<HTMLButtonElement>();
    const btnResultadosRef = React.createRef<HTMLButtonElement>();
    const { addToast } = useToasts();
    const [audio] = useState(new Audio(window.location.origin + '/sounds/Chord.mp3'));

    function obterUltimaNumeracao(value: string): string {

        let qntCasaNumericas = 0;

        for (let i = value.length - 1; i >= 0; i--) {
            if (!Number.isNaN(Number(value[i]))) {
                qntCasaNumericas++;
            } else {
                break;
            }
        }

        console.log(value.substring(0, value.length - qntCasaNumericas))
        console.log(value.substring(value.length - qntCasaNumericas).padStart(qntCasaNumericas, '0'))
        setCondicaoDaBusca(value.substring(0, value.length - qntCasaNumericas))
        setCondicaoNumericaDaBusca(value.substring(value.length - qntCasaNumericas).padStart(qntCasaNumericas, '0'))
        return value.substring(value.length - qntCasaNumericas).padStart(qntCasaNumericas, '0');
    }

    async function buscarDados(condicaoBusca: string, posicao: number) {
        await Api.get(`${condicaoBusca}`)
            .then(res => {
                lista.unshift({
                    chassi: res.data.chassi,
                    placa: res.data.placa,
                    renavam: res.data.renavam,
                    situacao: res.data.situacao,
                    motor: res.data.motor,
                    alvo: res.data.alvo,
                    condicaoBusca: res.data.condicaoBusca,
                    dataBusca: res.data.dataBusca,
                    posicao
                })
                setLista([...lista]);

                if (res.data.alvo) {
                    addToast("Veiculo alvo encontrado!", {
                        appearance: 'success',
                        autoDismiss: true,
                    })
                    dispararAudio();
                    setAtualizarResultados(!atualizarResultados);
                }
            })
            .catch(erro => {
                lista.unshift({
                    chassi: "Ocorreu uma falha durante a busca, verificar servidor!",
                    placa: "",
                    renavam: "",
                    situacao: "",
                    motor: "",
                    alvo: false,
                    condicaoBusca: chassi !== "" ? chassi : motor,
                    dataBusca: new Date().toLocaleString(),
                    posicao
                })
                setLista([...lista]);
                console.log(erro.message)
            })
    }

    function handleLimparCampos() {
        btnLimparRef.current?.blur();
        setConstinuarBuscas(false);
        setMotor("");
        setChassi("");
        setQntConsultas(1);
        setCondicaoDaBusca("");
        setCondicaoNumericaDaBusca("0");
        setPosicaoConsultaAtual(0);
        setLista([]);
        setDesabilitarCampos(false);
        setShowProgressBar(false);
        setOcupado(false);
    }

    function atualizarValores(valor: string) {
        obterUltimaNumeracao(valor);
    }

    function setConstinuarBuscas(value: boolean) {
        const obj = document.getElementById("continuarConsulta");
        if (obj) obj.innerText = value ? "true" : "false";
    }

    function getContinuarBuscas(): boolean {
        const obj = document.getElementById("continuarConsulta");
        if (obj)
            return obj.innerText === "true" ? true : false;
        else
            return false;
    }

    function handlePararBuscas() {
        btnPararBuscasRef.current?.blur();
        setConstinuarBuscas(false)
        setMotor("");
        setChassi("");
        setQntConsultas(1);
        setCondicaoDaBusca("");
        setCondicaoNumericaDaBusca("0");
        setPosicaoConsultaAtual(0);
        setDesabilitarCampos(false);
        setShowProgressBar(false);
        setOcupado(false);
    }

    async function handleIniciarBuscas() {
        btnIniciarBuscasRef.current?.blur();
        if (qntConsultas === 0) return;

        if (motor.trim() === "" && chassi.trim() === "") {
            addToast("Preencha o campo Motor ou Chassi!", {
                appearance: 'info',
                autoDismiss: true,
            })
            return;
        }

        setOcupado(true);
        setConstinuarBuscas(true);
        setShowProgressBar(true);
        setDesabilitarCampos(true);
        let posicao = posicaoConsultaAtual;

        if (motor !== "") {
            while ((posicao < qntConsultas) && getContinuarBuscas()) {

                var termoNumerico = String(Number(condicaoNumericaDaBusca) + posicao)
                    .padStart(condicaoNumericaDaBusca.length, '0');
                var termoDeBusca = condicaoDaBusca.trim() + termoNumerico;

                await buscarDados(`consultarveiculos/motor/${termoDeBusca}`, posicao + 1);

                posicao++;
                setPosicaoConsultaAtual(posicao);
            }
        } else if (chassi !== "") {
            while ((posicao < qntConsultas) && getContinuarBuscas()) {

                var termoNumerico = String(Number(condicaoNumericaDaBusca) + posicao)
                    .padStart(condicaoNumericaDaBusca.length, '0');
                var termoDeBusca = condicaoDaBusca.trim() + termoNumerico;

                await buscarDados(`consultarveiculos/chassi/${termoDeBusca}`, posicao + 1)

                posicao++;
                setPosicaoConsultaAtual(posicao);
            }
        }

        setConstinuarBuscas(false);
        setShowProgressBar(false);
        setDesabilitarCampos(false);
        setOcupado(false);
    }

    const dispararAudio = () => {
        if (audio.played) {
            audio.pause()
            audio.currentTime = 0
        }
        audio.play()
    }

    function getStyleAlvo(condicao: boolean): CSSProperties {
        if (condicao) {
            return { backgroundColor: "#2ecc71", color: "#FFF" } as CSSProperties
        }
        else {
            return {} as CSSProperties
        }
    }

    function changeQntResultados(quantidade:number){
        setQntResultados(quantidade);
    }

    return (
        <>
            <NavBarCustom ocupado={ocupado} />
            <ResultadoModal changeQntResultados={changeQntResultados} refresh={atualizarResultados} show={showModalResultado} onHide={() => { setShowModalResultado(false) }} />
            <div hidden={true} id="continuarConsulta" ref={continuarConsultaRef}>false</div>
            <Container id="container-home">
                <Row>
                    <Col md="4">
                        <label className="inputs">
                            Chassi
                            <input type="text"
                                disabled={disabilitarCampos}
                                value={chassi}
                                onChange={e => {
                                    setChassi((e.target.value).trim());
                                    atualizarValores((e.target.value).trim());
                                    setMotor("");
                                }} />
                        </label>
                    </Col>
                    <Col md="4">
                        <label className="inputs">
                            Motor
                            <input type="text"
                                disabled={disabilitarCampos}
                                value={motor}
                                onChange={e => {
                                    setMotor((e.target.value).trim());
                                    atualizarValores((e.target.value).trim());
                                    setChassi("");
                                }} />
                        </label>
                    </Col>
                    <Col md="4">
                        <label className="inputs">
                            Buscas
                            <input disabled={disabilitarCampos}
                                type="number"
                                value={qntConsultas}
                                onChange={e => setQntConsultas(Number(e.target.value))
                                } />
                        </label>
                    </Col>
                </Row>
                <Row className="container-btn-actions">
                    <Col>
                        <Button
                            variant="info"
                            ref={btnIniciarBuscasRef}
                            disabled={disabilitarCampos}
                            onClick={handleIniciarBuscas}
                        >
                            Iniciar
                        </Button>{' '}
                        <Button
                            variant="danger"
                            ref={btnPararBuscasRef}
                            onClick={handlePararBuscas}
                        >
                            Parar
                        </Button>{' '}
                        <Button
                            variant="secondary"
                            ref={btnLimparRef}
                            disabled={disabilitarCampos}
                            onClick={handleLimparCampos}
                        >
                            Limpar
                        </Button>
                    </Col>
                    <Col
                        style={{
                            textAlign: "right",
                            marginTop: "20px"
                        }}>
                        <Badge badgeContent={qntResultados}
                            invisible={qntResultados === 0 ? true : false}
                            color="error"
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}>
                            <Button
                                variant="info"
                                ref={btnResultadosRef}
                                disabled={disabilitarCampos}
                                onClick={() => { setShowModalResultado(true); btnResultadosRef.current?.blur(); }}

                                style={{
                                    margin: 0,
                                }}>
                                Resultados Salvos
                            </Button>
                        </Badge>
                    </Col>
                </Row>
                <ProgressBar
                    variant="success"
                    animated
                    now={posicaoConsultaAtual}
                    max={qntConsultas}
                    hidden={!showProgressBar}
                />
                <Row>
                    <b>Lista de itens da busca</b>
                </Row>
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Data-Hora</th>
                            <th>Busca</th>
                            <th>Chassi</th>
                            <th>Motor</th>
                            <th>Placa</th>
                            <th>Renavam</th>
                            <th>Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            lista?.map((item, idx) =>
                                item.situacao !== "" ?
                                    <tr key={idx} style={getStyleAlvo(item.alvo)}>
                                        <td>{item.posicao}</td>
                                        <td>{item.dataBusca}</td>
                                        <td>{item.condicaoBusca}</td>
                                        <td>{item.chassi}</td>
                                        <td>{item.motor}</td>
                                        <td>{item.placa}</td>
                                        <td>{item.renavam}</td>
                                        <td>{item.situacao}</td>
                                    </tr>
                                    :
                                    <tr key={idx}>
                                        <td>{item.posicao}</td>
                                        <td>{item.dataBusca}</td>
                                        <td>{item.condicaoBusca}</td>
                                        <td colSpan={5}>{item.chassi}</td>
                                    </tr>
                            )
                        }
                    </tbody>
                </Table>
                <Row>
                    <Col>
                        {
                            lista?.length === 0 &&
                            <Alert variant="primary">
                                Não há registros de buscas!
                            </Alert>
                        }
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default Home;