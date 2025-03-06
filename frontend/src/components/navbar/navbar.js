import React, {useContext} from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import {ThemeContext} from "../../Theme";
import "./navbar.css"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {AuthContext} from "../../AuthContext";
import {LogoutRounded} from "@mui/icons-material";

const CustomNavbar = () => {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const {isAuthenticated} = useContext(AuthContext);

    return (
        <div>
            {/* Navbar */}
            <Navbar expand="md" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="text-primary fw-bold">
                        <Nav.Link href="/">
                            <img style={{display: "inline", marginRight: 10}} width={50} src={"/images/doggo_big.png"}/>
                            <div style={{display: "inline"}}>
                                Dwello
                            </div>
                        </Nav.Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls=" basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto" style={{alignItems: "center"}}>
                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/main" className="text-white"><HomeRoundedIcon/></Nav.Link>
                            }
                            <div className="header-toggle-buttons">
                                <button onClick={() => toggleTheme()}>{theme}</button>
                            </div>

                            {!isAuthenticated ?
                                null
                                :
                                <NavDropdown title="Zarządzaj" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/myHomes">Moje lokacje</NavDropdown.Item>
                                    <NavDropdown.Item href="/myDevices">
                                        Moje urządzenia
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.3">Reguły</NavDropdown.Item>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item href="#action/3.4">
                                        Separated link
                                    </NavDropdown.Item>
                                </NavDropdown>
                            }


                            {/*<Nav.Link as={Link} to="/manage" className="text-white">Zarządzaj</Nav.Link>*/}

                            {!isAuthenticated ?
                                null
                                :
                                <span>
                                    <Nav.Link href="/charts" className="text-white">Wykresy</Nav.Link>
                                    <Nav.Link href="/history" className="text-white">Historia</Nav.Link>
                                </span>
                            }

                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/userProfile" className="text-white">
                                    <img width={35} src={"/images/doggo_big.png"}/>
                                </Nav.Link>
                            }

                            {!isAuthenticated ?
                                <Nav.Link href="/login" className="text-white"><LoginRoundedIcon/></Nav.Link> :
                                <Nav.Link href="/logout" className="text-white"><LogoutRounded/></Nav.Link>}

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default CustomNavbar;