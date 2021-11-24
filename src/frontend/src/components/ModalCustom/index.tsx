import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./styles.css";

type ModalCustomProps = {
	show: boolean;
	tipo: string;
	campo: string;
	valorAtual: string;
	onHide: () => void;
	modificado: (valor: boolean) => void;
	onChange: (valor: string) => void;
}

const ModalCustom = ({ show, onHide, tipo, campo, valorAtual, modificado, onChange }: ModalCustomProps) => {
	const [valor, setValor] = useState<string>(valorAtual);

	useEffect(() => {
		setValor(valorAtual);
	}, [valorAtual]);

	return (
		<>
			{tipo === "edit"
				?
				<Modal show={show}
					onHide={onHide}
					backdrop="static"
					keyboard={false}
					className="modal-dialog-detalhe-campo"
					centered>
					<Modal.Header>
						<Modal.Title>Editar Campo {campo}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="form-group">
							<label>Campo</label>
							<input
								type="text"
								className="form-control"
								value={campo}
								disabled
							/>
						</div>
						<br></br>
						<div className="form-group">
							<label>Campo Esperado</label>
							<input
								type="text"
								className="form-control"
								value={valor}
								required
								onChange={e => {onChange(e.target.value); setValor(e.target.value)}}
							/>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="default" onClick={onHide}>
							Cancelar
						</Button>
						<Button variant="info"
							onClick={() => {
								onHide();
								modificado(true);
							}}>

							Salvar
						</Button>
					</Modal.Footer>
				</Modal>
				:
				<Modal show={show}
					onHide={onHide}
					backdrop="static"
					keyboard={false}
					className="modal-dialog-detalhe-campo"
					centered>
					<Modal.Header>
						<Modal.Title>Descartar modificações</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>Deseja descartar as modificações realizadas?</p>
						<p className="text-warning"><small>Ao prosseguir todas as modificações serão perdidas.</small></p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="default" onClick={onHide}>
							Não
						</Button>
						<Button variant="danger" onClick={onHide}>
							Sim
						</Button>
					</Modal.Footer>
				</Modal>
			}
		</>
	)
}

export default ModalCustom;