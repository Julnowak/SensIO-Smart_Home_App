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
import {AuthProvider} from "./AuthContext";
import Logout from "./components/logout/logout";
import History from "./components/history/history";
import UserDevicesPage from "./components/userDevicesPage/UserDevicesPage";
import UserHomesPage from "./components/locations/UserHomesPage/UserHomesPage";
import DevicePage from "./components/DevicePage/DevicePage";
import AddHome from "./components/locations/addHome/addHome";
import BuildingPage from "./components/BuildingPage/BuildingPage";
import Dashboard from "./components/dashboard/dashboard";
import UserRoomsPage from "./components/userRoomsPage/userRoomsPage";

function App() {
    const { theme } = useContext(ThemeContext);

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
                        <Route path="/myRooms" element={<UserRoomsPage/>}/>
                        <Route path="/addHome" element={<AddHome/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/device/:id" element={<DevicePage/>}/>
                        <Route path="/home/:id" element={<BuildingPage/>}/>
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
