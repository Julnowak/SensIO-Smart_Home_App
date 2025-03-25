import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../client"; // Import the configured Axios instance
import { API_BASE_URL } from "../../../config";

const NewDevice = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");
    const [deviceData, setDeviceData] = useState({
        name: "",
        serial_number: "",
        topic: "",
        info: "",
        brand: "",
        room: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setDeviceData({ ...deviceData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await client.post(
                API_BASE_URL + "device/",
                deviceData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Device added:", response.data);
            setSuccess(true);
            setTimeout(() => navigate("/devices"), 1500); // Redirect after success
        } catch (err) {
            console.error("Error adding device:", err);
            setError("Failed to add device. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">
            <div className="card shadow-lg p-4" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">Add New Device</h2>

                    {success && <div className="alert alert-success text-center">Device added successfully!</div>}
                    {error && <div className="alert alert-danger text-center">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Device Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={deviceData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Serial Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="serial_number"
                                value={deviceData.serial_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Topic</label>
                            <input
                                type="text"
                                className="form-control"
                                name="topic"
                                value={deviceData.topic}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Info</label>
                            <textarea
                                className="form-control"
                                name="info"
                                value={deviceData.info}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Brand</label>
                            <input
                                type="text"
                                className="form-control"
                                name="brand"
                                value={deviceData.brand}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Room</label>
                            <input
                                type="text"
                                className="form-control"
                                name="room"
                                value={deviceData.room}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="text-center">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Adding..." : "Add Device"}
                            </button>
                            <a href="/myDevices" className="btn btn-outline-secondary ms-3">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewDevice;
