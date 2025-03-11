import React, {useState, useEffect} from "react";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Paginator from "../../../paginator/paginator";
import {Add} from "@mui/icons-material";
import "./UserHomesPage.css"


const UserHomesPage = () => {

    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const token = localStorage.getItem("access");

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
    const [totalPages, setTotalPages] = useState(Math.ceil(filteredLocations.length / itemsPerPage));

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await client.get(API_BASE_URL + "myHomes/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                setLocations(response.data);  // Update locations with fetched data
                setFilteredLocations(response.data); // Initialize filtered locations
            } catch (error) {
                console.error("Failed to fetch locations", error);
            }
        };

        if (token) {
            fetchLocations();
        }
    }, [token]); // Fetch data only when token changes

    // Filtering logic runs separately
    useEffect(() => {
        const filtered = locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase()));
        setFilteredLocations(filtered);
        setCurrentPage(1);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [search, locations]); // Runs when search or locations change


    return (<div style={{maxWidth: 1000, margin: "auto"}}>
        <div style={{maxWidth: 1000, margin: "0 20px"}}>
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <h1 style={{textAlign: "left", margin: 0}}>
                    Moje Lokacje
                </h1>

                <a href={"/addHome"}>
                    <button className="btn btn-dark" style={{marginLeft: "auto"}}>
                        <Add fontSize={"large"}/>
                        <span className="button-text">Nowa lokacja</span>
                    </button>
                </a>
            </div>
            <div style={{ backgroundColor: "#dccaed", padding: 10, borderRadius: 10}}>
                            <div style={{ display: "flex", maxWidth: 400, justifyContent: "space-between", alignItems: "center",}}>
                <h5 style={{textAlign: "left", margin: 0, minWidth: 200}}>
                    Aktualna lokacja:
                </h5>
                <select
                    className="form-control"
                >

                    {currentItems.map((location: Home) => (
                        location.current ? <option selected>
                            {location.name}
                        </option> : <option>
                            {location.name}
                        </option>

                    ))}
                </select>
            </div>
            </div>

            <h3 style={{textAlign: "left", margin: "20px 0"}}>
                Wszystkie lokacje
            </h3>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Szukaj lokacji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <ul className="list-group mb-3">
                {currentItems.map((location: Home) => (
                    <a href={`/home/${location.home_id}`} style={{textDecoration: "none"}} key={location.home_id}>
                        <li
                            style={location.current ? {backgroundColor: "#ddcbee"} : {backgroundColor: "white"}}
                            className="list-group-item"
                        >
                            <div style={{display: "flex", alignItems: "center"}}>
                                {/* Możesz tu dodać obraz */}
                                <img
                                    src="https://www.colorland.pl/storage/app/uploads/public/a29/0MV/8xL/a290MV8xLmpwZyExY2E4OTk4Zjg1M2ZmNzYxODgyNDhhNmMyZjU1MjI5Ng==.jpg"
                                    alt={location.name}
                                    style={{width: "50px", height: "50px", marginRight: "10px"}}/>

                                <div style={{flex: 1, textAlign: "left"}}>
                                    <h3>{location.name}</h3>
                                    <p>{location.address}</p>
                                </div>

                                <div>
                                    {location.current ? <CheckCircleIcon/> : null}
                                </div>
                            </div>
                        </li>
                    </a>))}
            </ul>


            <Paginator totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
        </div>
    </div>);
};

export default UserHomesPage;