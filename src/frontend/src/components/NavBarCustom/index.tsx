import { Navbar, Container } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import './styles.css';

interface navBarCustomProps {
    ocupado: boolean
}

const NavBarCustom = ({ ocupado }: navBarCustomProps) => {
    const history = useHistory();

    const handleConfiguracoes = () => {
        if (ocupado) return;

        history.replace("/config");
    }

    return (
        <Navbar bg="dark" variant="dark" className="navbar-custom">
            <Container>
                <Navbar.Brand href="#home" className="noselect">
                    <img
                        src={window.location.origin + "/img/icon.png"}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        alt="icon busca automatizada"
                    />
                    {' '}Busca Automatizada
                </Navbar.Brand>
                <i className="material-icons"
                    data-toggle="tooltip"
                    onClick={handleConfiguracoes}
                    style={{ color: "white", cursor: "pointer" }}
                    title="Configurações">
                    &#xe8b8;
                </i>
            </Container>
        </Navbar>
    )
}

export default NavBarCustom;