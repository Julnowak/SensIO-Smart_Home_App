import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage";
import Login from "./components/login/login";
import CustomNavbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import { ThemeContext } from "./Theme";
import React, {useContext, useEffect, useState} from "react";
import UserProfile from "./components/userProfile/userProfile";
import Main from "./components/main/main";
import {API_BASE_URL} from "./config";
import client from "./client";
import CookieConsent from "./components/cookieConsent/cookieConsent";

function App() {
    const { theme } = useContext(ThemeContext);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        client.get(`${API_BASE_URL}/user/`)
            .then(function () {
                console.log("Zalogowano")
            })
            .catch(function () {
                console.log("Nie udało się zalogować")
            });

    }, []);

    return (
        <div className={`App ${theme}`}>
            <BrowserRouter>
                {/* Navbar */}
                <CustomNavbar/>

                <div className="min-vh-100 bg-light">
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/userProfile" element={<UserProfile/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/main" element={<Main/>}/>
                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>
                {/*<CookieConsent/>*/}

            </BrowserRouter>
        </div>
    );
}

export default App;
