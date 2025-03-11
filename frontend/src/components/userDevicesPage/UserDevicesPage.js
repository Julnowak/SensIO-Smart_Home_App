import React, {useState, useEffect} from "react";
import {Add} from "@mui/icons-material";
import "../userDevicesPage/UserDevicesPage.css"
import client from "../../client";
import {API_BASE_URL} from "../../config";
import Paginator from "../../paginator/paginator";

const UserDevicesPage = () => {
    const exampleDevices = [
        {id: 1, name: "Smart TV", description: "Telewizor 4K", room: "Salon", color: "#ff5733"},
        {id: 2, name: "Laptop", description: "Dell XPS 15", room: "Biuro", color: "#33ff57"},
        {id: 3, name: "Smartphone", description: "iPhone 13 Pro", room: "Sypialnia", color: "#3357ff"},
        {id: 4, name: "Głośnik Bluetooth", description: "JBL Charge 5", room: "Kuchnia", color: "#ff33a8"},
        {id: 5, name: "Konsola", description: "PlayStation 5", room: "Salon", color: "#ffa533"},
        {id: 6, name: "Tablet", description: "iPad Air", room: "Sypialnia", color: "#a533ff"}
    ];


    const [devices, setDevices] = useState(exampleDevices);
    const [filteredDevices, setFilteredDevices] = useState(exampleDevices);
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
            <div className="mt-4" style={{maxWidth: 1000, margin: "20px"}}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "30px auto"
                }}>
                    <h1 style={{textAlign: "left", margin: 0}}>
                        Moje urządzenia
                    </h1>

                    <a href={"/addDevice"}>
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
                        <a href={`/device/${device.id}`} style={{textDecoration: "none"}}>
                            <li key={device.id} className="list-group-item d-flex align-items-center">
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "red",
                                    marginRight: "10px"
                                }}></div>
                                <div>
                                    <h5>{device.name}</h5>
                                    <p>{device.description}</p>
                                    <small>{device.room}</small>
                                </div>
                            </li>
                        </a>
                    ))}
                </ul>
                <Paginator totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
        </div>
    );
};

export default UserDevicesPage;