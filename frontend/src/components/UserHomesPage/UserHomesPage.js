import React, {useState, useEffect} from "react";

const UserHomesPage = () => {
    const exampleLocations = [
        {id: 1, name: "Warszawa", description: "Stolica Polski"},
        {id: 2, name: "Kraków", description: "Miasto Królów"},
        {id: 3, name: "Gdańsk", description: "Port nad Bałtykiem"},
        {id: 4, name: "Wrocław", description: "Miasto mostów"},
        {id: 5, name: "Poznań", description: "Miasto koziołków"},
        {id: 6, name: "Łódź", description: "Miasto przemysłu"}
    ];

    const [locations, setLocations] = useState(exampleLocations);
    const [filteredLocations, setFilteredLocations] = useState(exampleLocations);
    const [search, setSearch] = useState("");
    const [newLocation, setNewLocation] = useState({name: "", description: ""});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const filtered = locations.filter((location) =>
            location.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredLocations(filtered);
        setCurrentPage(1);
    }, [search, locations]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

    const addLocation = () => {
        if (newLocation.name.trim() === "") return;
        const updatedLocations = [...locations, {...newLocation, id: locations.length + 1}];
        setLocations(updatedLocations);
        setFilteredLocations(updatedLocations);
        setNewLocation({name: "", description: ""});
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Moje Lokacje</h1>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Szukaj lokacji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nazwa nowej lokacji"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                />
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Opis nowej lokacji"
                    value={newLocation.description}
                    onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                />
                <button className="btn btn-primary" onClick={addLocation}>Dodaj lokację</button>
            </div>
            <ul className="list-group mb-3">
                {currentItems.map((location) => (
                    <li key={location.id} className="list-group-item">
                        <h5>{location.name}</h5>
                        <p>{location.description}</p>
                    </li>
                ))}
            </ul>
            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Poprzednia
                </button>
                <span>Strona {currentPage} z {totalPages}</span>
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Następna
                </button>
            </div>
        </div>
    );
};

export default UserHomesPage;