import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import React, { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import { FaMicrochip, FaBuilding, FaBarcode, FaInfoCircle, FaIndustry } from "react-icons/fa";

const availableRooms = [
    {name: "Salon", color: "#ff5733"},
    {name: "Biuro", color: "#33ff57"},
    {name: "Sypialnia", color: "#3357ff"},
    {name: "Kuchnia", color: "#ff33a8"}
];

const DevicePage = () => {
    const [device, setDevice] = useState({});
    const params = useParams();
    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await client.get(API_BASE_URL + `device/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setDevice(response.data);  // Update locations with fetched data
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };

        if (token) {
            fetchDevice();
        }
    }, [params.id, token]); // Fetch data only when token changes



    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">
            <div className="card shadow-lg p-4" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">{device.name}</h2>

                    <div className="d-flex align-items-center mb-3">
                        <FaMicrochip className="me-2 text-primary" size={20} />
                        <strong>Topic:</strong> <span className="ms-2">{device.topic || "N/A"}</span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <FaBuilding className="me-2 text-success" size={20} />
                        <strong>Room:</strong> <span className="ms-2">{device.room || "Not assigned"}</span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <FaBarcode className="me-2 text-warning" size={20} />
                        <strong>Serial Number:</strong> <span className="ms-2">{device.serial_number || "Unknown"}</span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                        <FaIndustry className="me-2 text-danger" size={20} />
                        <strong>Brand:</strong> <span className="ms-2">{device.brand || "Unknown"}</span>
                    </div>

                    <div className="d-flex align-items-start mb-3">
                        <FaInfoCircle className="me-2 text-info" size={20} />
                        <strong>Info:</strong>
                        <p className="ms-2 mb-0">{device.info || "No additional information available"}</p>
                    </div>

                    <div className="text-center mt-4">
                        <a href="/myDevices" className="btn btn-outline-primary">Back to Devices</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevicePage;