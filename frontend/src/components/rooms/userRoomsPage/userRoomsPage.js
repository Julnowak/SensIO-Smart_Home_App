import React, {useState, useEffect} from "react";
import {Add} from "@mui/icons-material";
import "../../devices/userDevicesPage/UserDevicesPage.css"
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import Paginator from "../../../paginator/paginator";

const UserRoomsPage = () => {

    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await client.get(API_BASE_URL + "myRooms/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setRooms(response.data);  // Update locations with fetched data
                setFilteredRooms(response.data); // Initialize filtered locations
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };

        if (token) {
            fetchRooms();
        }
    }, [token]); // Fetch data only when token changes


    useEffect(() => {
        const filtered = rooms.filter((device) =>
            device.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredRooms(filtered);
        setCurrentPage(1);
    }, [search, rooms]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

    return (
        <div style={{maxWidth: 1000, margin: "auto"}}>
            <div style={{maxWidth: 1000, padding: "20px"}}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h1 style={{textAlign: "left", margin: "20px 0"}}>
                        Moje pokoje
                    </h1>

                    {/*<a href={"/addDevice"}>*/}
                    {/*    <button className="btn btn-dark" style={{marginLeft: "auto"}}>*/}
                    {/*        <Add fontSize={"large"}/>*/}
                    {/*        <span className="button-text">Nowe urządzenie</span>*/}
                    {/*    </button>*/}
                    {/*</a>*/}
                </div>

                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Szukaj pokoju..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select>
                    <option>
                        Lokacja Jagoda
                    </option>
                </select>

                <select>
                    <option>
                        Piętro 1
                    </option>
                </select>



                <ul className="list-group mb-3">
                    {currentItems.map((room) => (
                        <a href={`/room/${room.room_id}`} style={{textDecoration: "none"}}>
                            <li key={room.room_id} className="list-group-item d-flex align-items-center">
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "red",
                                    marginRight: "10px"
                                }}></div>
                                <div>
                                    <h5>{room.name}</h5>
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

export default UserRoomsPage;