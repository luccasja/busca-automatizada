import { useEffect, useState } from "react";
import { Row, Col, Container, Button, Form, Table } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import Switch from "../../components/Switch";
import ModalCustom from "../../components/ModalCustom";
import NavBarCustom from "../../components/NavBarCustom";
import Api from "../../services/Api";
import "./styles.css";
import { stringify } from "querystring";

export interface configuracaoType {
	urlMotor: string;
	urlChassi: string;
	alvo: string;
	intervaloDeConsulta?: string;
	templates: templateType[];
}

export interface campoType {
	nome: string;
	valor: string;
}

export interface templateType {
	ativo: boolean;
	formato: string;
	campos: campoType[];
}

function Configuracao() {
	
	const dadosInit = {
		urlMotor: "",
		urlChassi: "",
		alvo:"",
		templates: [{
			ativo: true,
			formato: "JSON",
			campos: []
		}]
	};

	const [integracaoJson, setIntegracaoJson] = useState<boolean>(true);
	const [integracaoHtml, setIntegracaoHtml] = useState<boolean>(false);
	const [campoSelecionado, setCampoSelecionado] = useState<string>("");
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [modificado, setModificado] = useState<boolean>(false);
	const [novoValor, setNovoValor] = useState<string>("");
	const [valorAtual, setValorAtual] = useState<string>("");
	const [modoEdicao, setModoEdicao] = useState<boolean>(false);
	const [dados, setDados] = useState<configuracaoType>(dadosInit);
	const [urlMotor, setUrlMotor] = useState<string>("");
	const [urlChassi, setUrlChassi] = useState<string>("");
	const [alvo, setAlvo] = useState<string>("");
	const [intervaloDeConsulta, setIntervaloDeConsulta] = useState("")

	const history = useHistory();
	const { addToast } = useToasts();
	
	//sound
    const [audio] = useState(new Audio(window.location.origin+'/sounds/Chord.mp3'));

	useEffect(() => {
		Api.get(`templates`)
			.then(resposta => {
				resposta.status === 200 && setDados(resposta.data);
				processarFormatoDeIntegracaoAtiva(resposta.data.templates);
				setUrlMotor(resposta.data.urlMotor);
				setUrlChassi(resposta.data.urlChassi);
				setAlvo(resposta.data.alvo);
				//setIntervaloDeConsulta(resposta.data.intervaloDeConsulta);
			})
			.catch(erro => {
				setDados(dadosInit);
				console.log(erro.message);
				addToast("Falha ao buscar as configurações: "+erro.message,{ 
					appearance: 'error', 
					autoDismiss: true, 
				})
			})

	}, []);

	const processarFormatoDeIntegracaoAtiva = (configs: templateType[]) => {
		configs.forEach(config => {
			if (config.ativo) {
				if (config.formato === "JSON") {
					setIntegracaoJson(true);
					setIntegracaoHtml(false);
				}
				else {
					setIntegracaoJson(false);
					setIntegracaoHtml(true);
				}
			}
		})
	}

	const handleTipoDeIntegracao = () => {
		let configs = dados.templates;

		configs.forEach(config => {
			if (config.formato === "JSON")
				config.ativo = !integracaoJson;

			if (config.formato === "HTML")
				config.ativo = !integracaoHtml;
		});

		setIntegracaoJson(!integracaoJson);
		setIntegracaoHtml(!integracaoHtml);
		setModificado(true);
	}

	const handleCloseModal = () => {
		setModalShow(false);
	}

	const handleEditarCampo = (e: any, campo: string, valorAtual: string) => {
		e.preventDefault();
		if (!modoEdicao) return;

		setCampoSelecionado(campo);
		setValorAtual(valorAtual);
		setModalShow(true);
	}

	const handleAtualizarValor = (valor: string) => {
		if (valor.trim() === "") return;

		setNovoValor(valor);
	}

	const handleModificado = (valor: boolean) => {
		if (novoValor.trim() === "") return;

		let dadosParaModificacao = dados;

		dadosParaModificacao.templates.forEach(configuracao => {
			if (configuracao.ativo) {
				configuracao.campos.forEach(campo => {
					if (campo.nome === campoSelecionado) {
						campo.valor = novoValor;
					}
				});
			}
		});

		setDados(dadosParaModificacao);
		setModificado(valor);
		setNovoValor("");
	}

	const defaultConfig = () => {
		setModificado(false);
		setModoEdicao(false);
	}

	const handleModoEdicao = () => {
		setModoEdicao(true);
	}

	const handleRetornaParaInicio = () => {
		defaultConfig();
		history.replace('/');
	}

	const onChangeUrlMotor = (valor: string) => {
		if (valor.trim() === "") return;

		let config = dados;
		config.urlMotor = valor;
		setUrlMotor(valor);
		setDados(config);
		setModificado(true);
	}

	const onChangeUrlChassi = (valor: string) => {
		if (valor.trim() === "") return;

		let config = dados;
		config.urlChassi = valor;
		setUrlChassi(valor);
		setDados(config);
		setModificado(true);
	}

	const onChangeAlvo = (valor: string) => {
		if (valor.trim() === "") return;

		let config = dados;
		config.alvo = valor;
		setAlvo(valor);
		setDados(config);
		setModificado(true);
	}

	// const onChangeIntervaloDeConsulta = (valor: string) => {
	// 	if (valor.trim() === "") return;

	// 	let config = dados;
	// 	config.intervaloDeConsulta = valor;
	// 	setIntervaloDeConsulta(valor);
	// 	setDados(config);
	// 	setModificado(true);
	// }

	const dispararAudio = () => {
		if(audio.played){
			audio.pause()
			audio.currentTime = 0
		}
		audio.play()
	}

	const handleSalvarConfiguracoes = () => {
		if ((!modificado) && (dados.templates.length === 0)) return;

		Api.post("templates", dados)
			.then(resposta => {
				resposta.status === 200 && defaultConfig();
				addToast(resposta.data.Ok,{ 
					appearance: 'success', 
					autoDismiss: true, 
				})
				dispararAudio();
			})
			.catch(erro => {
				console.log(erro.message);
				addToast("Falha ao salvar configurações:" + erro.message,{ 
					appearance: 'error', 
					autoDismiss: true, 
				})
			})
	}

	return (
		<>
			<NavBarCustom ocupado={true}/>
			<ModalCustom
				show={modalShow}
				onHide={handleCloseModal}
				tipo="edit"
				campo={campoSelecionado}
				valorAtual={valorAtual}
				modificado={handleModificado}
				onChange={handleAtualizarValor}
			/>
			<Container id="container-config">
				
				<Row>
					<Col><h4 className="noselect">Configurações de busca</h4></Col>
					<Col style={{display: "flex", justifyContent: "end"}}>
						<Button hidden={modificado}
							variant="primary"
							className="btn-crud-config btn-retornar"
							onClick={handleRetornaParaInicio}>
							<b>Página Inicial</b>
						</Button>
						<Button hidden={!modificado}
							variant="success"
							className="btn-crud-config btn-salvar-config"
							onClick={handleSalvarConfiguracoes}>
							<b>Salvar</b>
						</Button>
						<Button hidden={modoEdicao}
							variant="info"
							className="btn-crud-config"
							onClick={handleModoEdicao}>
							<b>Editar</b>
						</Button>
					</Col>
				</Row>
				<br></br>
				<Row>
					<Col>
						<b className="noselect">Formato de Integração</b>
					</Col>
					<Col className="containerSwitch">
						<label htmlFor="switchJson" className="noselect">JSON</label>
						<Switch
							id="switchJson"
							disabled={!modoEdicao}
							btnSize={16}
							lableHeight={20}
							isOn={integracaoJson}
							handleToggle={handleTipoDeIntegracao}
						/>
					</Col>
					<Col className="containerSwitch">
						<label htmlFor="switchHtml" className="noselect">HTML</label>
						<Switch
							id="switchHtml"
							disabled={!modoEdicao}
							btnSize={16}
							lableHeight={20}
							isOn={integracaoHtml}
							handleToggle={handleTipoDeIntegracao}
						/>
					</Col>
				</Row>
				<br></br>
				<Row>
					<Col>
						<b className="noselect">Url para consultas</b>
					</Col>
				</Row>
				<br></br>
				<Row>
					<Col>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2" className="noselect">
								Chassi
							</Form.Label>
							<Col sm="10">
								<Form.Control
									disabled={!modoEdicao}
									placeholder="http://link.com/chassi"
									value={urlChassi}
									onChange={(e) => onChangeUrlChassi(e.target.value)}
								/>
							</Col>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2" className="noselect">
								Motor
							</Form.Label>
							<Col sm="10">
								<Form.Control
									disabled={!modoEdicao}
									placeholder="http://link.com/motor"
									value={urlMotor}
									onChange={(e) => onChangeUrlMotor(e.target.value)}
								/>
							</Col>
						</Form.Group>
					</Col>
				</Row>
				{/* <Row>
					<Col>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2" className="noselect">
								Intervalo (segundos)
							</Form.Label>
							<Col sm="10">
								<Form.Control
									disabled={!modoEdicao}
									placeholder="0"
									value={intervaloDeConsulta}
									onChange={(e) => onChangeIntervaloDeConsulta(e.target.value)}
								/>
							</Col>
						</Form.Group>
					</Col>
				</Row> */}
				<br></br>
				<Row>
					<Col>
						<b className="noselect">Veiculo alvo</b>
					</Col>
				</Row>
				<br></br>
				<Row>
					<Col>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="2" className="noselect">
								Alvo
							</Form.Label>
							<Col sm="10">
								<Form.Control
									disabled={!modoEdicao}
									placeholder="campo=valor|campo2=valor"
									value={alvo}
									onChange={(e) => onChangeAlvo(e.target.value)}
								/>
							</Col>
						</Form.Group>
					</Col>
				</Row>
				<br></br>
				{
					dados.templates.map((configuracao, idx) =>
						<Row key={idx.toString()} hidden={configuracao.formato === "JSON" ? !integracaoJson : !integracaoHtml}>
							<Col>
								<b className="noselect">Campos para recepção dos dados {configuracao.formato}</b>

								<Table responsive striped hover>
									<thead className="noselect">
										<tr>
											<th>Campo</th>
											<th>Campo Esperado</th>
											<th>Editar</th>
										</tr>
									</thead>
									<tbody>
										{
											configuracao.campos.map(campo =>
												<tr key={campo.nome}>
													<td>{campo.nome}</td>
													<td>{campo.valor}</td>
													<td>
														<a href="" className="edit" data-toggle="modal">
															<i className="material-icons icon-color"
																data-toggle="tooltip"
																title="Editar"
																onClick={(e) => handleEditarCampo(e, campo.nome, campo.valor)}>
																&#xE254;
															</i>
														</a>
													</td>
												</tr>
											)
										}
									</tbody>
								</Table>
							</Col>
						</Row>
					)
				}
			</Container>
		</>
	)
}

export default Configuracao;