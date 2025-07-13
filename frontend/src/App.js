import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage";
import Login from "./components/user/login/login";
import CustomNavbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import { ThemeContext } from "./Theme";
import React, {useContext} from "react";
import UserProfile from "./components/user/userProfile/userProfile";
import Main from "./components/main/main";
import {AuthProvider} from "./AuthContext";
import Logout from "./components/user/logout/logout";
import History from "./components/history/history";
import UserDevicesPage from "./components/devices/userDevicesPage/userDevicesPage";
import DevicePage from "./components/devices/devicePage/devicePage";
import AddHome from "./components/locations/addHome/addHome";
import BuildingPage from "./components/locations/BuildingPage/BuildingPage";
import Dashboard from "./components/dashboard/dashboard";
import UserRoomsPage from "./components/rooms/userRoomsPage/userRoomsPage";
import NewDevice from "./components/devices/newDevice/newDevice";
import RoomPage from "./components/rooms/roomPage/roomPage";
import Register from "./components/user/register/register";
import Notifications from "./components/notifications/notifications";
import ThemeLoader from "./themeLoader";
import ForgotPasswordPage from "./components/forgotPassword/forgotPassword";
import TermsOfService from "./components/termsOfService/termsOfService";
import PrivacyPolicy from "./components/termsOfService/privacyPolicy";
import Contact from "./components/termsOfService/contact";
import About from "./components/termsOfService/about";
import LayoutEditor from "./components/layoutEditor";
import UserLocationsPage from "./components/locations/UserHomesPage/UserHomesPage";
import NotFoundPage from "./components/notFoundPage/notFoundPage";
import Rules from "./components/rules/rules";
import EnergyDashboard from "./components/dashboard/EnergyDashboard";
import Settings from "./components/settings/settings";
import ScrollToTop from "./components/stt";

function App() {
    const { mode } = useContext(ThemeContext);

    return (
        <ThemeLoader>
        <div data-theme={mode}>
            <BrowserRouter>
                <AuthProvider>
                {/* Navbar */}
                <CustomNavbar/>
                <ScrollToTop />

                <div className="background-main min-vh-100">
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/userProfile" element={<UserProfile/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/logout" element={<Logout/>}/>
                        <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                        <Route path="/main" element={<Main/>}/>
                        <Route path="/history" element={<History/>}/>
                        <Route path="/myDevices" element={<UserDevicesPage/>}/>
                        <Route path="//newDevice" element={<NewDevice/>}/>
                        <Route path="/myHomes" element={<UserLocationsPage/>}/>
                        <Route path="/myRooms" element={<UserRoomsPage/>}/>
                        <Route path="/addHome" element={<AddHome/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/device/:id" element={<DevicePage/>}/>
                        <Route path="/home/:id" element={<BuildingPage/>}/>
                        <Route path="/room/:id" element={<RoomPage/>}/>
                        <Route path="/notifications" element={<Notifications/>}/>
                        <Route path="/rules" element={<Rules/>}/>

                        <Route path="/terms-of-service" element={<TermsOfService/>}/>
                        <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        <Route path="/about" element={<About/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                        <Route path="/editor" element={<LayoutEditor/>}/>
                        <Route path="/test" element={<EnergyDashboard/>}/>

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>
                </AuthProvider>
            </BrowserRouter>
        </div>
        </ThemeLoader>
    );
}

export default App;
