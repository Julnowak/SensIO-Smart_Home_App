import React, { useState } from "react";

const AddHome = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [floors, setFloors] = useState(1);
  const [rooms, setRooms] = useState([]);

  const handleAddFloor = () => {
    setFloors(floors + 1);
    setRooms([...rooms, []]);
  };

  const handleAddRoom = (floorIndex) => {
    const newRooms = [...rooms];
    newRooms[floorIndex].push({ type: "Pokój", id: Date.now() });
    setRooms(newRooms);
  };

  return (
    <div className="container mt-4">
      <div className="card p-3 mb-3">
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Nazwa lokacji"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Adres"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder="Uwagi"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="mb-3">
        {Array.from({ length: floors }, (_, floorIndex) => (
          <div key={floorIndex} className="card p-3 mb-2">
            <h5 className="card-title">Piętro {floorIndex + 1}</h5>
            <button className="btn btn-primary mb-2" onClick={() => handleAddRoom(floorIndex)}>
              Dodaj pokój
            </button>
            <div className="d-flex flex-wrap">
              {rooms[floorIndex]?.map((room, index) => (
                <div key={room.id} className="border p-2 m-1">
                  {room.type} {index + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-success" onClick={handleAddFloor}>Dodaj piętro</button>
    </div>
  );
};

export default AddHome;
