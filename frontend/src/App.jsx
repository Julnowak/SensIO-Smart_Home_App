import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage.jsx";
import Login from "./components/user/login/login.jsx";
import CustomNavbar from "./components/navbar/navbar.jsx";
import Footer from "./components/footer/footer.jsx";
import { ThemeContext } from "./Theme.jsx";
import React, {useContext} from "react";
import UserProfile from "./components/user/userProfile/userProfile.jsx";
import Main from "./components/main/main.jsx";
import {AuthProvider} from "./AuthContext.jsx";
import Logout from "./components/user/logout/logout.jsx";
import History from "./components/history/history.jsx";
import UserDevicesPage from "./components/devices/userDevicesPage/userDevicesPage.jsx";
import DevicePage from "./components/devices/devicePage/devicePage.jsx";
import AddHome from "./components/locations/addHome/addHome.jsx";
import BuildingPage from "./components/locations/BuildingPage/BuildingPage.jsx";
import Dashboard from "./components/dashboard/dashboard.jsx";
import UserRoomsPage from "./components/rooms/userRoomsPage/userRoomsPage.jsx";
import NewDevice from "./components/devices/newDevice/newDevice.jsx";
import RoomPage from "./components/rooms/roomPage/roomPage.jsx";
import Register from "./components/user/register/register.jsx";
import Notifications from "./components/notifications/notifications.jsx";
import ThemeLoader from "./themeLoader.jsx";
import ForgotPasswordPage from "./components/forgotPassword/forgotPassword.jsx";
import TermsOfService from "./components/termsOfService/termsOfService.jsx";
import PrivacyPolicy from "./components/termsOfService/privacyPolicy.jsx";
import Contact from "./components/termsOfService/contact.jsx";
import About from "./components/termsOfService/about.jsx";
import LayoutEditor from "./components/layoutEditor.jsx";
import UserLocationsPage from "./components/locations/UserHomesPage/UserHomesPage.jsx";
import NotFoundPage from "./components/notFoundPage/notFoundPage.jsx";
import Rules from "./components/rules/rules.jsx";
import EnergyDashboard from "./components/dashboard/EnergyDashboard.jsx";
import Settings from "./components/settings/settings.jsx";
import ScrollToTop from "./components/stt.jsx";
import SensorPage from "./components/sensors/sensorPage.jsx";

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

                        <Route path="/sensor/:id" element={<SensorPage/>}/>
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
