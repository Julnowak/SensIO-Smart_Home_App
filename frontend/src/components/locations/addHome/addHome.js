import React, { useState } from "react";
import EditableCanvas from "../../editableCanvas/editableCanvas";

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
    <div style={{margin: "auto"}}>

      <div className="p-3 mb-3">

        <div style={{margin: 30, maxWidth: 1000}}>
          <h1 style={{textAlign: "left"}}>Nowa lokacja</h1>
          <input
            type="text"
            className="form-control"
            placeholder="Nazwa lokacji"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            <EditableCanvas/>
          </div>
        ))}
      </div>

      <button className="btn btn-success" onClick={handleAddFloor}>Dodaj piętro</button>
      </div>

    </div>
  );
};

export default AddHome;
