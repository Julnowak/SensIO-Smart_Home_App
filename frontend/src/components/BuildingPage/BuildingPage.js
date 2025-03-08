import React, { useState, useEffect } from "react";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useParams} from "react-router-dom";

const BuildingPage = () => {
  const [location, setLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("access");
  const params = useParams()

  useEffect(() => {
    client.get(API_BASE_URL + "home/" + params.id,
        {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }) // Pobiera dane lokacji
      .then((response) => {
        setLocation(response.data);
        setFormData(response.data);
      })
      .catch((error) => console.error("Error fetching location:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // axios.put(`http://127.0.0.1:8000/api/location/${location.home_id}/`, formData)
    //   .then((response) => {
    //     setLocation(response.data);
    //     setIsEditing(false);
    //   })
    //   .catch((error) => console.error("Error updating location:", error));
  };

  if (!location) return <p className="text-center text-muted">Loading...</p>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-4">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "500px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h2>{isEditing ? "Edytuj lokalizację" : "Szczegóły lokalizacji"}</h2>
        </div>
        <div className="card-body">
          {isEditing ? (
            <div className="mb-3">
              <label className="form-label">Nazwa</label>
              <input name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Nazwa" />
              <label className="form-label mt-2">Adres</label>
              <input name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="Adres" />
              <label className="form-label mt-2">Uwagi</label>
              <textarea name="regards" value={formData.regards} onChange={handleChange} className="form-control" placeholder="Uwagi"></textarea>
              <label className="form-label mt-2">Liczba pięter</label>
              <input name="floor_num" type="number" value={formData.floor_num} onChange={handleChange} className="form-control" placeholder="Liczba pięter" />
              <button onClick={handleSave} className="btn btn-success w-100 mt-3">Zapisz</button>
            </div>
          ) : (
            <div>
              <p className="fs-5 fw-bold">{location.name}</p>
              <p className="text-muted">Adres: {location.address || "Brak danych"}</p>
              <p className="text-muted">Uwagi: {location.regards || "Brak"}</p>
              <p className="text-muted">Liczba pięter: {location.floor_num}</p>
              <p className="text-muted small">Kod: {location.code}</p>
              <button onClick={() => setIsEditing(true)} className="btn btn-dark w-100 mt-3">Edytuj</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingPage;
