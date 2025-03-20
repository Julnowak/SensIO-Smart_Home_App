import React, { useState, useEffect } from "react";
import { Add } from "@mui/icons-material";
import "../../devices/userDevicesPage/UserDevicesPage.css";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import Paginator from "../../../paginator/paginator";

const UserRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomsResponse = await client.get(API_BASE_URL + "myRooms/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRooms(roomsResponse.data);
                setFilteredRooms(roomsResponse.data);

                const locationsResponse = await client.get(API_BASE_URL + "locations/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLocations(locationsResponse.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };

        if (token) fetchData();
    }, [token]);

    useEffect(() => {
        if (selectedLocation) {
            const locationFloors = locations.find(loc => loc.name === selectedLocation)?.floors || [];
            setFloors(locationFloors);
            setSelectedFloor(locationFloors[0] || "");
        }
    }, [selectedLocation, locations]);

    useEffect(() => {
        let filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(search.toLowerCase()) &&
            (!selectedLocation || room.location === selectedLocation) &&
            (!selectedFloor || room.floor === selectedFloor)
        );
        setFilteredRooms(filtered);
        setCurrentPage(1);
    }, [search, selectedLocation, selectedFloor, rooms]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

    return (
        <div style={{ maxWidth: 1000, margin: "auto" }}>
            <div style={{ padding: "20px" }}>
                <h1>Moje pokoje</h1>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Szukaj pokoju..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select onChange={(e) => setSelectedLocation(e.target.value)} value={selectedLocation}>
                    <option value="">Wybierz lokację</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                </select>
                <select onChange={(e) => setSelectedFloor(e.target.value)} value={selectedFloor}>
                    <option value="">Wybierz piętro</option>
                    {floors.map(floor => (
                        <option key={floor} value={floor}>{`Piętro ${floor}`}</option>
                    ))}
                </select>
                <ul className="list-group mb-3">
                    {currentItems.map((room) => (
                        <a key={room.room_id} href={`/room/${room.room_id}`} style={{ textDecoration: "none" }}>
                            <li className="list-group-item d-flex align-items-center">
                                <div style={{ width: "20px", height: "20px", backgroundColor: "red", marginRight: "10px" }}></div>
                                <h5>{room.name}</h5>
                            </li>
                        </a>
                    ))}
                </ul>
                <Paginator totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
};

export default UserRoomsPage;
