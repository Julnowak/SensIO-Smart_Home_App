import React, {useContext} from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";
import { ThemeContext } from "../../Theme";
import "./navbar.css"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import Cookies from 'js-cookie';

const CustomNavbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    // if (cook)
    console.log(Cookies.get('csrftoken'))
    return (
        <div>
            {/* Navbar */}
            <Navbar bg={theme} expand="md" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="text-primary fw-bold">
                        <div>
                            <img style={{display: "inline", marginRight: 10}} width={50} src={"/images/doggo_big.png"}/>
                            <Nav.Link as={Link} style={{display: "inline"}} to="/">Dwello</Nav.Link>
                        </div>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls=" basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/" className="text-white"><HomeRoundedIcon/></Nav.Link>
                            <div className="header-toggle-buttons">
                                <button onClick={() => toggleTheme()}>{theme}</button>
                            </div>
                            <Nav.Link as={Link} to="/userProfile" className="text-white">Features</Nav.Link>
                            <Nav.Link as={Link} to="/about" className="text-white">About</Nav.Link>
                            <Nav.Link as={Link} to="/contact" className="text-white">Kontakt</Nav.Link>
                            <Nav.Link as={Link} to="/login" className="text-white"><LoginRoundedIcon/></Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default CustomNavbar;