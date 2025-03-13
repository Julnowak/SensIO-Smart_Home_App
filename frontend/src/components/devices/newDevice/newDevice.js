import { useState } from "react";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";

const NewDevice = () => {
    const [device, setDevice] = useState({
        name: "",
        serial_number: "",
        topic: "",
        info: "",
        room: ""
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setDevice({ ...device, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/api/devices/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(device)
            });
            if (response.ok) {
                setMessage("Urządzenie dodane pomyślnie");
                setDevice({ name: "", serial_number: "", topic: "", info: "", room: "" });
            } else {
                setMessage("Błąd podczas dodawania urządzenia");
            }
        } catch (error) {
            setMessage("Błąd sieci");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Dodaj urządzenie</h2>
                {message && <div className="alert alert-info text-center">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nazwa:</label>
                        <input type="text" className="form-control" name="name" value={device.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Numer seryjny:</label>
                        <input type="text" className="form-control" name="serial_number" value={device.serial_number} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Temat MQTT:</label>
                        <input type="text" className="form-control" name="topic" value={device.topic} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Informacje:</label>
                        <textarea className="form-control" name="info" value={device.info} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">ID Pokoju:</label>
                        <input type="number" className="form-control" name="room" value={device.room} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Dodaj</button>
                </form>
            </div>
        </div>
    );
};


export default NewDevice;