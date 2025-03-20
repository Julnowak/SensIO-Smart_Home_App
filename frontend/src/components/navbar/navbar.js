import React, {useContext, useEffect, useState} from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {ThemeContext} from "../../Theme";
import "./navbar.css"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {AuthContext} from "../../AuthContext";
import {DarkModeRounded, LightModeRounded, LogoutRounded} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const CustomNavbar = () => {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const {isAuthenticated} = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const token = localStorage.getItem("access");
    const image_set = localStorage.getItem("image_set")
    let flag = false;
    const [isSmallScreen, setIsSmallScreen] = useState(false);

      useEffect(() => {
        const handleResize = () => {
          setIsSmallScreen(window.innerWidth < 450); // You can adjust the threshold as needed
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial state

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data.profile_picture){
                    setImage(response.data.profile_picture.toString().slice(15));
                    localStorage.setItem(response.data.profile_picture.toString().slice(15));
                }
                else {
                    setImage("/images/basic/user_no_picture.png");
                    localStorage.setItem("/images/basic/user_no_picture.png");
                }

            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (!flag){
            if (token && !image_set) {
                fetchUserData();
            }
            else {
                setImage(image_set)
            }
            flag = true;
        }


    }, [image, image_set, token]);

    return (
        <div>
            {/* Navbar */}
            <Navbar expand="md" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="text-primary fw-bold">
                        <Nav.Link href="/">
                            <img style={{display: "inline", marginRight: 10}} width={50} src={theme=="dark"?"/images/basic/doggo_big_white.png":"/images/basic/doggo_big.png"}/>
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
                              <button className="theme-toggle-button" onClick={toggleTheme}>
                                {theme === "white" ? <LightModeRounded /> : <DarkModeRounded />}
                              </button>
                            </div>

                            {!isAuthenticated ?
                                null
                                :
                                <NavDropdown title="Zarządzaj" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/myHomes">
                                        Moje lokacje
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/myDevices">
                                        Moje urządzenia
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/myRooms">
                                        Moje pomieszczenia
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item href="/rules">
                                        Reguły
                                    </NavDropdown.Item>
                                </NavDropdown>
                            }


                            {/*<Nav.Link as={Link} to="/manage" className="text-white">Zarządzaj</Nav.Link>*/}

                            {!isAuthenticated ?
                                null
                                :
                                <>
                                    <Nav.Link href="/dashboard" className="text-white">Wykresy</Nav.Link>
                                    <Nav.Link href="/history" className="text-white">Historia</Nav.Link>
                                </>
                            }

                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/userProfile" className="text-white">
                                    <img width={35} style={{borderRadius: 17}} src={image}/>
                                </Nav.Link>
                            }

                            {!isSmallScreen ? (
                                // For small screens, show login/logout icon
                                <Nav.Link href={isAuthenticated ? '/logout' : '/login'} className="text-white">
                                  {isAuthenticated ? <LogoutRounded /> : <LoginRoundedIcon />}
                                </Nav.Link>
                              ) : (
                                // For larger screens, show full text (Login / Logout)
                                <Nav.Link href={isAuthenticated ? '/logout' : '/login'} className="text-white">
                                    {isAuthenticated ? <div><span style={{marginRight: 10}}>Wyloguj</span><LogoutRounded /></div> :
                                        <div><LoginRoundedIcon /><span style={{marginLeft: 10}}> Zaloguj</span></div>}
                                </Nav.Link>
                              )}

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default CustomNavbar;