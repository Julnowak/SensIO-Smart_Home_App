import React, {useState, useEffect} from "react";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useParams} from "react-router-dom";
import LayoutViewer from "../layoutViewer/layoutViewer";
import editableCanvas from "../editableCanvas/editableCanvas";
import EditableCanvas from "../editableCanvas/editableCanvas";
import {Add, Edit, EditOff} from "@mui/icons-material";

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
    }, [params.id, token]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSave = () => {
        // axios.put(`http://127.0.0.1:8000/api/location/${location.home_id}/`, formData)
        //   .then((response) => {
        //     setLocation(response.data);
            setIsEditing(false);
        //   })
        //   .catch((error) => console.error("Error updating location:", error));
    };

    if (!location) return <p className="text-center text-muted">Loading...</p>;

    return (
        <div style={{maxWidth: 1000, margin: "auto"}}>
            <div style={{maxWidth: 1000, margin: "20px"}}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "30px auto"
                }}>
                    <h1 style={{textAlign: "left", margin: 0}}>
                        {isEditing ?
                            <input name="name" value={formData.name} onChange={handleChange} className="form-control"
                                   placeholder="Nazwa"/>
                            : formData.name}
                    </h1>

                    {isEditing ?
                    <button onClick={() => setIsEditing(false)} className="btn btn-dark" style={{marginLeft: "auto"}}>
                        <EditOff fontSize={"medium"} style={{marginRight: 5}}/>
                        <span className="button-text">Anuluj</span>
                    </button>
                        :
                    <button onClick={() => setIsEditing(true)} className="btn btn-dark" style={{marginLeft: "auto"}}>
                        <Edit fontSize={"medium"} style={{marginRight: 5}}/>
                        <span className="button-text">Edytuj</span>
                    </button>}
                </div>

                {isEditing ? (
                    <div className="mb-3" style={{textAlign: "left"}}>
                        <label className="form-label mt-2">Adres</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="form-control"
                               placeholder="Adres"/>
                        <label className="form-label mt-2">Uwagi</label>
                        <textarea name="regards" value={formData.regards} onChange={handleChange}
                                  className="form-control" placeholder="Uwagi"></textarea>
                        <label className="form-label mt-2">Liczba pięter</label>
                        <input name="floor_num" type="number" value={formData.floor_num} onChange={handleChange}
                               className="form-control" placeholder="Liczba pięter"/>
                        <button onClick={handleSave} className="btn btn-success w-100 mt-3">Zapisz</button>
                        <EditableCanvas/>
                    </div>
                ) : (
                    <div style={{textAlign: "left"}}>
                        <p className="text-muted">Adres: {location.address || "Brak danych"}</p>
                        <p className="text-muted">Uwagi: {location.regards || "Brak"}</p>
                        <p className="text-muted">Liczba pięter: {location.floor_num}</p>
                        <p className="text-muted small">Kod: {location.code}</p>
                        <LayoutViewer/>
                    </div>
                )}


            </div>
        </div>
    );
};

export default BuildingPage;
