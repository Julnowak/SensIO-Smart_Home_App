import { createContext, useState, useEffect } from "react";
import { getUser, login, logout, register } from "./api";

export const AuthContext = createContext();

export const isUserAuthenticated = () => {
    const token = localStorage.getItem("access");
    return token !== null;  // Return true if the token exists, false otherwise
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUser();
            setUser(userData);
        };
        fetchUser();
    }, []);

    const loginUser = async (email, password) => {
        await login(email, password);
        const userData = await getUser();
        setUser(userData);
        setIsAuthenticated(true);
    };

    const registerUser = async (username, email, password, passwordSecond) => {
        await register(username, email, password, passwordSecond);
        await login(email, password);
        const userData = await getUser();
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logoutUser = () => {
        logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("access") !== null &&
        localStorage.getItem("refresh") !== null
    );

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, registerUser }}>
            {children}
        </AuthContext.Provider>
    );
};
