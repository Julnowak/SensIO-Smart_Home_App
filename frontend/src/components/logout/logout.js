import React, {useContext, useEffect} from 'react';
import {Navigate} from "react-router-dom";
import {AuthContext} from "../../AuthContext"

const Logout = async () => {
    const {logoutUser} = useContext(AuthContext);

    await logoutUser();


    return (
        <Navigate to="/"/>
    );
};

export default Logout;