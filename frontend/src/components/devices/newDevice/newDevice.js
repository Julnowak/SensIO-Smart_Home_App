import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  Paper,
  MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Devices as DevicesIcon,
  QrCode as QrCodeIcon,
  Room as RoomIcon,
  BrandingWatermark as BrandIcon, CheckCircle
} from "@mui/icons-material";
import {CgColorPicker} from "react-icons/cg";
import ColorPickerInput from "./colorPicker";
import {de} from "date-fns/locale";

const NewDevice = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const [deviceData, setDeviceData] = useState({
    name: "",
    serial_number: "",
    topic: "",
    info: "",
    brand: "",
    building: "",
    room: "",
    floor: "",
    color: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const handleChange = async (e) => {
  const { name, value } = e.target;

  // Prepare the new device data
  let newDeviceData = { ...deviceData, [name]: value };

  // If building changes, reset floor and room
  if (name === "building") {
    newDeviceData.floor = null;
    newDeviceData.room = null;

    try {
      const response = await client.get(`${API_BASE_URL}roomsNewDevice/${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFloors(response.data.floors);
      setRooms([]); // clear rooms too
    } catch (error) {
      console.error("Błąd podczas pobierania pięter", error);
    }
  }

  // If floor changes, reset room
  if (name === "floor") {
    newDeviceData.room = null;

    try {
      const response = await client.get(`${API_BASE_URL}roomsNewDevice/${deviceData.building}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { floorId: value },
      });
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Błąd podczas pobierania pokoi", error);
    }
  }

  // Finally, update deviceData
  setDeviceData(newDeviceData);
};

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await client.get(`${API_BASE_URL}myHomes/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuildings(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania urządzeń", error);
      }
    };
    if (token) fetchDevices();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    deviceData.color = selectedColor
    try {
      const response = await client.post(
        API_BASE_URL + "myDevices/",
        deviceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/myDevices"), 2000);
    } catch (err) {
      console.error("Error adding device:", err);
      setError(err.response?.data?.message || "Nie udało się dodać urządzenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
      <Card sx={{
        width: "100%",
        maxWidth: 800,
        borderRadius: 3,
        boxShadow: 3
      }}>
        <CardContent>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            gap: 2
          }}>
            <DevicesIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1">
              Dodaj nowe urządzenie
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nazwa urządzenia"
                  name="name"
                  value={deviceData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DevicesIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField
                  fullWidth
                  label="Marka"
                  name="brand"
                  value={deviceData.brand}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BrandIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField
                  fullWidth
                  label="Numer seryjny"
                  name="serial_number"
                  value={deviceData.serial_number}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>



              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Temat"
                  name="topic"
                  value={deviceData.topic}
                  onChange={handleChange}
                  helperText="Nazwa tematu MQTT do przesyłania danych"
                  required
                />
              </Grid>

              <Grid item xs={4} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="locationLabel">Lokacja*</InputLabel>
                  <Select
                    labelId="locationLabel"
                    id="location"
                    name={"building"}
                    value={deviceData.building}
                    label="Lokacja"
                    onChange={handleChange}
                    required
                  >
                    {buildings?.map((b) =>
                        <MenuItem value={b.home_id}>
                          {b.name}
                        </MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="floorLabel">Piętro</InputLabel>
                  <Select
                    labelId="floorLabel"
                    id="floor"
                    name={"floor"}
                    value={deviceData.floor}
                    label="Lokacja"
                    disabled={!deviceData.building}
                    onChange={handleChange}
                  >
                    {floors?.map((b) =>
                        <MenuItem value={b.floor_id}>
                          Piętro {b.floor_number}
                        </MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="roomLabel">Pomieszczenie</InputLabel>
                  <Select
                    labelId="roomLabel"
                    id="room"
                    name={"room"}
                    disabled={!deviceData.floor}
                    value={deviceData.room}
                    label="Pokój"
                    onChange={handleChange}
                  >
                    {rooms?.map((b) =>
                        <MenuItem value={b.room_id}>
                          {b.name}
                        </MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
              <ColorPickerInput
                      label="Background Color"
                      value={selectedColor}
                      onChange={(color) => setSelectedColor(color)}
                    />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dodatkowe informacje"
                  name="info"
                  value={deviceData.info}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate("/myDevices")}
                    color="primary"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? "Zapisuję..." : "Zapisz"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
          icon={<CheckCircle fontSize="inherit" />}
        >
          Urządzanie zostało dodane pomyślnie! Przekierowywanie...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewDevice;