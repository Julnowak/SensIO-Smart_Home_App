import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";
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
import {ChromePicker} from "react-color";

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
        color: "#2277ff"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [floors, setFloors] = useState([]);

    const handleChange = async (e) => {
        const {name, value} = e.target;

        console.log(name, value)
        if (name === "building") {
            try {
                const response = await client.get(`${API_BASE_URL}roomsNewDevice/${value}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setFloors(response.data.floors);
                setRooms([]);
                setDeviceData(prev => ({...prev, floor: '', room: ''}));
            } catch (error) {
                console.error("Błąd podczas pobierania pięter", error);
            }
        }

        if (name === "floor") {

            try {
                const response = await client.get(`${API_BASE_URL}roomsNewDevice/${deviceData.building}`, {
                    headers: {Authorization: `Bearer ${token}`},
                    params: {floorId: value},
                });
                setRooms(response.data.rooms);
                setDeviceData(prev => ({...prev, room: ''}));
            } catch (error) {
                console.error("Błąd podczas pobierania pokoi", error);
            }
        }

        setDeviceData(prev => ({...prev, [name]: value}));

    };

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await client.get(`${API_BASE_URL}myHomes/`, {
                    headers: {Authorization: `Bearer ${token}`},
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

        try {
            await client.post(
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
        <Box sx={{display: "flex", justifyContent: "center", p: 3}}>
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
                        <DevicesIcon color="primary" sx={{fontSize: 40}}/>
                        <Typography variant="h4" component="h1">
                            Dodaj nowe urządzenie
                        </Typography>
                    </Box>
                    <Divider sx={{mb: 4}}/>

                    {error && (
                        <Alert severity="error" sx={{mb: 3}}>
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
                                                <DevicesIcon color="action"/>
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
                                                <BrandIcon color="action"/>
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
                                                <QrCodeIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
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
                                <div>
                                    <TextField
                                        label="Kolor"
                                        value={deviceData.color}

                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <div
                                                        style={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            backgroundColor: deviceData.color,
                                                            border: '1px solid #ccc',
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        fullWidth
                                    />

                                    <Box p={2}>
                                        <Typography variant="subtitle1" gutterBottom>Wybierz kolor</Typography>
                                        <ChromePicker color={deviceData.color} onChange={(color) => {
                                            setDeviceData(prev => ({
                                                ...prev,
                                                color: color.hex, // hex is like "#ff0000"
                                            }));
                                        }}/>
                                    </Box>
                                </div>
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
                                        startIcon={<CancelIcon/>}
                                        onClick={() => navigate("/myDevices")}
                                        color="primary"
                                    >
                                        Anuluj
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> :
                                            <SaveIcon/>}
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
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{width: "100%"}}
                    icon={<CheckCircle fontSize="inherit"/>}
                >
                    Urządzanie zostało dodane pomyślnie! Przekierowywanie...
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NewDevice;