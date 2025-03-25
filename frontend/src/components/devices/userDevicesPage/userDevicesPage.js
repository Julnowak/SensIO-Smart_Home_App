import React, {useState, useEffect} from "react";
import {Add} from "@mui/icons-material";
import "./userDevicesPage.css"
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import Paginator from "../../../paginator/paginator";

const UserDevicesPage = () => {


    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await client.get(API_BASE_URL + "myDevices/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setDevices(response.data);  // Update locations with fetched data
                setFilteredDevices(response.data); // Initialize filtered locations
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };

        if (token) {
            fetchDevices();
        }
    }, [token]); // Fetch data only when token changes


    useEffect(() => {
        const filtered = devices.filter((device) =>
            device.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredDevices(filtered);
        setCurrentPage(1);
    }, [search, devices]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

    return (
        <div style={{maxWidth: 1000, margin: "auto"}}>
            <div style={{maxWidth: 1000, padding: "20px"}}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h1 style={{textAlign: "left", margin: "20px 0"}}>
                        Moje urządzenia
                    </h1>

                    <a href={"/newDevice"}>
                        <button className="btn btn-dark" style={{marginLeft: "auto"}}>
                            <Add fontSize={"large"}/>
                            <span className="button-text">Nowe urządzenie</span>
                        </button>
                    </a>
                </div>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Szukaj urządzenia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <ul className="list-group mb-3">
                    {currentItems.map((device) => (
                        <li
                            key={device.device_id}
                            className="list-group-item d-flex align-items-center"
                            style={{transition: "0.3s", cursor: "pointer", borderRadius: "8px"}}
                        >
                            <a
                                href={`/device/${device.device_id}`}
                                className="d-flex align-items-center text-decoration-none w-100"
                            >
                                <div
                                    className="rounded-circle me-3"
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        backgroundColor: device.color,
                                    }}
                                ></div>
                                <div className="flex-grow-1" style={{ textAlign: "left", marginLeft: 20}}>
                                    <h4 className="mb-1 text-dark">{device.name}</h4>
                                    <p className="mb-1 text-muted">{device.brand}, Nr. seryjny: {device.serial_number}</p>
                                    <p className="mb-0 text-muted">{device.room}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>

                <Paginator totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
        </div>
    );
};

export default UserDevicesPage;