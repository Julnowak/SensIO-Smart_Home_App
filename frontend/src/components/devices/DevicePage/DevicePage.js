import React, { useState } from "react";

const availableRooms = [
  { name: "Salon", color: "#ff5733" },
  { name: "Biuro", color: "#33ff57" },
  { name: "Sypialnia", color: "#3357ff" },
  { name: "Kuchnia", color: "#ff33a8" }
];

const DevicePage = () => {
  const [device, setDevice] = useState({
    name: "Smart TV",
    description: "Telewizor 4K z obsługą HDR",
    room: "Salon",
    image: "",
    options: {
      power: false,
      brightness: 50,
      volume: 30
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDevice((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (e) => {
    setDevice((prev) => ({ ...prev, room: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDevice((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePower = () => {
    setDevice((prev) => ({ ...prev, options: { ...prev.options, power: !prev.options.power } }));
  };

  const updateOption = (option, value) => {
    setDevice((prev) => ({ ...prev, options: { ...prev.options, [option]: value } }));
  };

  const roomColor = availableRooms.find(room => room.name === device.room)?.color || "#ccc";

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Edytuj Urządzenie</h1>
      <div className="card p-3">
        <div className="mb-3">
          <label className="form-label">Nazwa urządzenia</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={device.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Opis</label>
          <input
            type="text"
            className="form-control"
            name="description"
            value={device.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Pomieszczenie</label>
          <select className="form-control" value={device.room} onChange={handleRoomChange}>
            {availableRooms.map((room) => (
              <option key={room.name} value={room.name}>{room.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Zdjęcie urządzenia</label>
          <input type="file" className="form-control" onChange={handleFileChange} />
          {device.image && <img src={device.image} alt="Device" className="mt-3 img-fluid" style={{ maxWidth: "200px" }} />}
        </div>
        <div className="mb-3 d-flex align-items-center">
          <span className="me-2">Kolor pomieszczenia:</span>
          <div style={{ width: "20px", height: "20px", backgroundColor: roomColor, borderRadius: "50%" }}></div>
        </div>
        <div className="mb-3">
          <h5>Opcje urządzenia</h5>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={device.options.power}
              onChange={togglePower}
            />
            <label className="form-check-label ms-2">Włącz/Wyłącz</label>
          </div>
          <div className="mt-3">
            <label className="form-label">Jasność</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              value={device.options.brightness}
              onChange={(e) => updateOption("brightness", e.target.value)}
            />
          </div>
          <div className="mt-3">
            <label className="form-label">Głośność</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
              value={device.options.volume}
              onChange={(e) => updateOption("volume", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicePage;