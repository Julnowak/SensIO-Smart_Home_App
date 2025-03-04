import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage";
import Login from "./components/login/login";
import CustomNavbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import { ThemeContext } from "./Theme";
import React, { useContext } from "react";
import UserProfile from "./components/userProfile/userProfile";

function App() {
    const { theme } = useContext(ThemeContext);

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
                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>

            </BrowserRouter>
        </div>
    );
}

export default App;
