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
import {AuthProvider} from "./AuthContext";
import Logout from "./components/logout/logout";
import History from "./components/history/history";
import UserDevicesPage from "./components/UserDevicesPage/UserDevicesPage";
import UserHomesPage from "./components/UserHomesPage/UserHomesPage";
import DevicePage from "./components/DevicePage/DevicePage";

function App() {
    const { theme } = useContext(ThemeContext);

    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //
    //     client.get(`${API_BASE_URL}/user/`)
    //         .then(function () {
    //             console.log("Zalogowano")
    //         })
    //         .catch(function () {
    //             console.log("Nie udało się zalogować")
    //         });
    //
    // }, []);

    return (
        <div className={`App ${theme}`}>
            <BrowserRouter>
                <AuthProvider>
                {/* Navbar */}
                <CustomNavbar/>

                <div className="background-main min-vh-100">
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/userProfile" element={<UserProfile/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/logout" element={<Logout/>}/>
                        <Route path="/main" element={<Main/>}/>
                        <Route path="/history" element={<History/>}/>
                        <Route path="/myDevices" element={<UserDevicesPage/>}/>
                        <Route path="/myHomes" element={<UserHomesPage/>}/>
                        <Route path="/device/:id" element={<DevicePage/>}/>
                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>
                {/*<CookieConsent/>*/}
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
