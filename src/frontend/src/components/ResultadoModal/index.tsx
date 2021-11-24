import { useState, useEffect } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { useToasts } from 'react-toast-notifications';
import { CSVLink, CSVDownload } from "react-csv";
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import Api from "../../services/Api";

interface resultadoModalProps {
	show: boolean;
	onHide: () => void;
	refresh: boolean;
	changeQntResultados: (quantidade: number) => void;
}

export interface resultadosEncontradosType {
	id: string;
	data: string;
	marcaModelo: string;
	chassi: string;
	anoFabModelo: string;
	placa: string;
	situacao: string;
}

const ResultadoModal = ({ show, onHide, refresh, changeQntResultados }: resultadoModalProps) => {
	const [resultadosEncontrados, setResultadosEncontrados] = useState<resultadosEncontradosType[]>([]);
	const { addToast } = useToasts();

	useEffect(() => {

		Api.get('resultados')
			.then(resposta => {
				if (resposta.status === 200) {
					setResultadosEncontrados(resposta.data);
					changeQntResultados(resposta.data.length)
				}
			})
			.catch(erro => {
				console.log(erro.message);
				addToast("Falha ao buscar resultados encontrados:" + erro.message, {
					appearance: 'error',
					autoDismiss: true,
				})
			})

	}, [refresh])

	function handleLimparDados() {
		Api.delete('resultados')
			.then(resposta => {
				if (resposta.status === 200) {
					addToast(resposta.data.Ok, {
						appearance: 'success',
						autoDismiss: true,
					})
					setResultadosEncontrados([]);
					refresh = true;
				}
			})
			.catch(erro => {
				console.log(erro.message);
				addToast("Falha ao remover registros:" + erro.message, {
					appearance: 'error',
					autoDismiss: true,
				})
			});
	}

	return (
		<Modal show={show} lg
			onHide={onHide}
			backdrop="static"
			keyboard={false}
			centered
			size="xl">
			<Modal.Header>
				<Modal.Title>Resultados encontrados</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Table striped hover responsive>
					<thead>
						<tr>
							<th>Data-Hora</th>
							<th>Marca/Modelo</th>
							<th>Chassi</th>
							<th>Ano</th>
							<th>Placa</th>
							<th>Situação</th>
						</tr>
					</thead>
					<tbody>
						{
							resultadosEncontrados.map(resultado =>
								<tr key={resultado.id}>
									<td>{resultado.data}</td>
									<td>{resultado.marcaModelo}</td>
									<td>{resultado.chassi}</td>
									<td>{resultado.anoFabModelo}</td>
									<td>{resultado.placa}</td>
									<td>{resultado.situacao}</td>
								</tr>
							)
						}
					</tbody>
				</Table>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={handleLimparDados}>
					Limpar <DeleteIcon />
				</Button>
				<CSVLink data={resultadosEncontrados}
				filename={`ResultadosEncontrados${new Date().getTime()}.csv`}>
					<Button variant="info">
						Baixar CSV <GetAppIcon />
					</Button>
				</CSVLink>;
				<Button variant="info" onClick={() => { onHide() }}>
					Ok
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ResultadoModal;