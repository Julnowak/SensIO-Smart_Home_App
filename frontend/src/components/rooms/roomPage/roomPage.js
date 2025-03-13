import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";

const RoomPage = () => {
    const params = useParams();
    const [room, setRoom] = useState({});
    const [light, setLight] = useState({});
    const [warning, setWarning] = useState({});

    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await client.get(API_BASE_URL + "myRooms/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setRoom(response.data);  // Update locations with fetched data
                setLight(response.data.light);  // Update locations with fetched data
                setWarning(response.data.warning);  // Update locations with fetched data
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };

        if (token) {
            fetchRoom();
        }
    }, [token]); // Fetch data only when token changes

    const handleLightToggle = () => {
        // Zmiana statusu światła
        client.put(`http://127.0.0.1:8000/api/room/${params.id}/`, {light: !light})
            .then(response => {
                setLight(!light);
            })
            .catch(error => {
                console.error('Błąd podczas zmiany statusu światła:', error);
            });
    };

    const handleWarningToggle = () => {
        // Zmiana statusu ostrzeżenia
        client.put(`http://127.0.0.1:8000/api/rooms/${params.id}/`, {warning: !warning})
            .then(response => {
                setWarning(!warning);
            })
            .catch(error => {
                console.error('Błąd podczas zmiany statusu ostrzeżenia:', error);
            });
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">{room.name}</h5>
                <p className="card-text">Piętro: {room.floor ? room.floor.name : 'Brak'}</p>
                <p className="card-text">Lokalizacja: {room.position ? JSON.stringify(room.position) : 'Nie podano'}</p>

                <div className="form-group">
                    <label>Światło</label>
                    <button
                        className={`btn ${light ? 'btn-success' : 'btn-danger'}`}
                        onClick={handleLightToggle}
                    >
                        {light ? 'Włączone' : 'Wyłączone'}
                    </button>
                </div>

                <div className="form-group">
                    <label>Ostrzeżenie</label>
                    <button
                        className={`btn ${warning ? 'btn-warning' : 'btn-secondary'}`}
                        onClick={handleWarningToggle}
                    >
                        {warning ? 'Aktywne' : 'Nieaktywne'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomPage;