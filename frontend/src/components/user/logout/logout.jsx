import React, {useContext, useEffect} from 'react';
import {Navigate} from "react-router-dom";
import {AuthContext} from "../../../AuthContext.jsx"

const Logout = () => {
    const {logoutUser} = useContext(AuthContext);

    logoutUser();

    return (
        <Navigate to="/"/>
    );
};

export default Logout;