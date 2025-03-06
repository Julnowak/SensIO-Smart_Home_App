import React, {useState, useEffect} from "react";

const UserDevicesPage = () => {
    const exampleDevices = [
        {id: 1, name: "Smart TV", description: "Telewizor 4K", room: "Salon", color: "#ff5733"},
        {id: 2, name: "Laptop", description: "Dell XPS 15", room: "Biuro", color: "#33ff57"},
        {id: 3, name: "Smartphone", description: "iPhone 13 Pro", room: "Sypialnia", color: "#3357ff"},
        {id: 4, name: "Głośnik Bluetooth", description: "JBL Charge 5", room: "Kuchnia", color: "#ff33a8"},
        {id: 5, name: "Konsola", description: "PlayStation 5", room: "Salon", color: "#ffa533"},
        {id: 6, name: "Tablet", description: "iPad Air", room: "Sypialnia", color: "#a533ff"}
    ];

    const availableRooms = [
        {name: "Salon", color: "#ff5733"},
        {name: "Biuro", color: "#33ff57"},
        {name: "Sypialnia", color: "#3357ff"},
        {name: "Kuchnia", color: "#ff33a8"}
    ];

    const [devices, setDevices] = useState(exampleDevices);
    const [filteredDevices, setFilteredDevices] = useState(exampleDevices);
    const [search, setSearch] = useState("");
    const [newDevice, setNewDevice] = useState({name: "", description: "", room: "", color: ""});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    const addDevice = () => {
        if (newDevice.name.trim() === "" || newDevice.room === "") return;
        const roomData = availableRooms.find(room => room.name === newDevice.room);
        const updatedDevices = [...devices, {...newDevice, id: devices.length + 1, color: roomData.color}];
        setDevices(updatedDevices);
        setFilteredDevices(updatedDevices);
        setNewDevice({name: "", description: "", room: "", color: ""});
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Moje Urządzenia</h1>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Szukaj urządzenia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nazwa nowego urządzenia"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                />
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Opis nowego urządzenia"
                    value={newDevice.description}
                    onChange={(e) => setNewDevice({...newDevice, description: e.target.value})}
                />
                <select
                    className="form-control mb-2"
                    value={newDevice.room}
                    onChange={(e) => setNewDevice({...newDevice, room: e.target.value})}
                >
                    <option value="">Wybierz pomieszczenie</option>
                    {availableRooms.map((room) => (
                        <option key={room.name} value={room.name}>{room.name}</option>
                    ))}
                </select>
                <button className="btn btn-primary" onClick={addDevice}>Dodaj urządzenie</button>
            </div>
            <ul className="list-group mb-3">
                {currentItems.map((device) => (
                    <a href={`/device/${device.id}`}>
                        <li key={device.id} className="list-group-item d-flex align-items-center">
                            <div style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: device.color,
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

export default UserDevicesPage;