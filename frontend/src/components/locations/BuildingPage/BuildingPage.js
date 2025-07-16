import React, {useState, useEffect} from "react";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import {useNavigate, useParams} from "react-router-dom";
import LayoutViewer from "../../layoutViewer/layoutViewer";
import {
    Edit,
    Home,
    LocationOn,
    Notes,
    Layers,
    Save,
    Cancel,
    Settings,
    Schema,
    AddLocation,
    Map, Delete, Close
} from "@mui/icons-material";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
    CircularProgress,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, DialogContentText
} from "@mui/material";
import {styled} from "@mui/material/styles";
import {MapContainer, TileLayer, Marker, useMapEvents} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {ChromePicker} from "react-color";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const BuildingCard = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    borderRadius: 16,
    boxShadow: theme.shadows[2],
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        boxShadow: theme.shadows[4]
    }
}));

const LocationMarker = ({location, setLocation}) => {
    const map = useMapEvents({
        click(e) {
            setLocation({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
    });

    return location === null ? null : (
        <Marker
            position={[location.lat, location.lng]}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setLocation({
                        lat: position.lat,
                        lng: position.lng
                    });
                },
            }}
        />
    );
};

const MapDialog = ({open, onClose, location, setLocation}) => {
    const [tempLocation, setTempLocation] = useState(location);

    const handleSave = () => {
        setLocation(tempLocation);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Wybierz lokalizację na mapie</DialogTitle>
            <DialogContent sx={{height: '500px'}}>
                <MapContainer
                    center={tempLocation || [52.237, 21.017]} // Default to Warsaw center
                    zoom={tempLocation ? 15 : 5}
                    style={{height: '100%', width: '100%', borderRadius: '8px'}}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker location={tempLocation} setLocation={setTempLocation}/>
                </MapContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Anuluj</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Zapisz lokalizację
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const BuildingPage = () => {
    const [location, setLocation] = useState(null);
    const [layout, setLayout] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [homeIdToDelete, setHomeIdToDelete] = useState(null);
    const navigate = useNavigate()

    const token = localStorage.getItem("access");
    const params = useParams();
    const [openNotes, setOpenNotes] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "home/" + params.id, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                const homeData = response.data.homeData;
                setLocation(homeData);
                setFormData(homeData);
                setLayout(response.data.roomsData);
                setSelectedFloor(homeData.floors[0].floor_id);


                console.log(response.data.roomsData)
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        };

        fetchData();
    }, [params.id, token]);

    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/room_updates/${params.id}/`);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLayout((prevLayout) =>
                prevLayout.map((room) =>
                    room.room_id === data.room_id ? {...room, light: data.light} : room
                )
            );
        };

        return () => ws.close();
    }, [params.id]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSave = () => {
        setIsEditing(false);
        // Add API call to save changes here
    };

    const handleChangeFloor = async (e) => {
        setSelectedFloor(e.target.value)
        const response = await client.get(API_BASE_URL + "home/" + params.id, {
            headers: {Authorization: `Bearer ${token}`},
            params: {floorId: e.target.value},
        });
        setLayout(response.data.roomsData);
        console.log(response.data.roomsData)
    };

    const handleLocationChange = (newLocation) => {
        setFormData(prev => ({
            ...prev,
            lat: newLocation.lat,
            lng: newLocation.lng
        }));
    };

    if (!location) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60}/>
            </Box>
        );
    }

    const handleOpenDialog = (homeId) => {
        setHomeIdToDelete(homeId);
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setHomeIdToDelete(null);
    };

    const confirmDelete = async () => {
        try {
            await client.delete(`${API_BASE_URL}home/${homeIdToDelete}/`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            handleCloseDialog();
            navigate("/myHomes");
        } catch (error) {
            console.error("Failed to delete location", error);
        }
    };


    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <BuildingCard elevation={3}>
                <Box sx={{mb: 4}}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Nazwa budynku"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        fontSize: '2rem',
                                        fontWeight: 700
                                    }
                                }}
                            />
                        ) : (
                            <Typography variant="h3" component="h1" sx={{fontWeight: 700}}>
                                {formData.name}
                            </Typography>
                        )}

                        <Box>
                            <IconButton
                                onClick={() => setIsEditing(!isEditing)}
                                color={isEditing ? "error" : "primary"}
                                sx={{
                                    border: `1px solid ${isEditing ? theme.palette.error.main : theme.palette.primary.main}`,
                                    borderRadius: 2,
                                    right: 5,
                                    p: 1.5,
                                    '&:hover': {
                                        backgroundColor: isEditing ? theme.palette.error.light : theme.palette.primary.light
                                    }
                                }}
                            >
                                {isEditing ? <Cancel/> : <Edit/>}
                            </IconButton>

                            <IconButton
                                onClick={() => {
                                    handleOpenDialog(location.home_id)
                                }}
                                color={"error"}
                                sx={{
                                    border: `1px solid ${theme.palette.error.main}`,
                                    borderRadius: 2,
                                    p: 1.5,
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.light
                                    }
                                }}
                            >
                                <Delete/>
                            </IconButton>
                        </Box>
                    </Box>

                    <Divider sx={{my: 3}}/>

                    {isEditing ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Adres"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Liczba pięter"
                                    name="floor_num"
                                    type="number"
                                    value={formData.floor_num || ''}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Layers/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Lokalizacja
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 2}}>
                                        <TextField
                                            label="Szerokość geogr."
                                            name="lat"
                                            value={formData.lat || ''}
                                            onChange={handleChange}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Długość geogr."
                                            name="lng"
                                            value={formData.lng || ''}
                                            onChange={handleChange}
                                            fullWidth
                                        />
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Map/>}
                                        onClick={() => setMapDialogOpen(true)}
                                        sx={{mt: 1}}
                                    >
                                        Wybierz na mapie
                                    </Button>
                                    {(!formData.lat || !formData.lng) && (
                                        <Alert severity="info" sx={{mt: 1}}>
                                            Lokalizacja nie została jeszcze ustawiona
                                        </Alert>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setIsEditing(false)}
                                        startIcon={<Cancel/>}
                                        sx={{px: 3, py: 1}}
                                    >
                                        Anuluj
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        startIcon={<Save/>}
                                        sx={{px: 3, py: 1}}
                                    >
                                        Zapisz zmiany
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={6} md={6}>
                                <Box sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <LocationOn color="action"/>
                                    <Typography variant="body1">
                                        <strong>Adres:</strong> {location.address || "Nie określono"}
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Layers color="action"/>
                                    <Typography variant="body1">
                                        <strong>Liczba pięter:</strong> {location.floor_num}
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Layers color="action"/>
                                    <Typography variant="body1">
                                        <strong>Rok
                                            budowy:</strong> {location.year_of_construction ? location.year_of_construction : "Brak danych"}
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Layers color="action"/>
                                    <Typography variant="body1">
                                        <strong>Powierzchnia budynku:</strong> {location.building_area ? (
                                        <>
                                            {location.building_area} m<sup>2</sup>
                                        </>
                                    ) : (
                                        'Brak danych'
                                    )}

                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Layers color="action"/>
                                    <Typography variant="body1">
                                        <strong>Typ
                                            budynku:</strong> {location.building_type ? location.building_type : "Nieznany"}
                                    </Typography>
                                </Box>
                                <Button onClick={() => setOpenNotes(true)} variant={"outlined"}
                                        sx={{mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Notes/>
                                    <Typography>
                                        Zobacz uwagi
                                    </Typography>
                                </Button>
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    height: '100%',
                                    minHeight: '300px',
                                    backgroundColor: theme.palette.grey[100]
                                }}>
                                    {location.image ? (
                                        <img
                                            src={location.image?.slice(15)}
                                            alt={location.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            color: theme.palette.text.secondary
                                        }}>
                                            <Typography variant="body1">Brak zdjęcia budynku</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {!isEditing && (
                        <Grid item xs={12} md={6}>
                        {(location.lat && location.lng) ? (
                            <Box sx={{mt: 2}}>
                                <Typography variant="body1" sx={{mb: 1, fontWeight: 500}}>
                                    <LocationOn sx={{verticalAlign: 'middle', mr: 1}}/>
                                    Lokalizacja na mapie
                                </Typography>
                                <Box sx={{height: '200px', borderRadius: 2, overflow: 'hidden'}}>
                                    <MapContainer
                                        center={[location.lat, location.lng]}
                                        zoom={15}
                                        style={{height: '100%', width: '100%'}}
                                        dragging={false}
                                        zoomControl={false}
                                        scrollWheelZoom={false}
                                        doubleClickZoom={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[location.lat, location.lng]}/>
                                    </MapContainer>
                                </Box>
                            </Box>
                        ) : (
                            <Alert severity="info" color={"gray"} sx={{mt: 2, border: '1px solid gray'}}>
                                Lokalizacja nie została ustawiona
                            </Alert>
                        )}
                    </Grid>
                    )}

                </Box>

                <Divider sx={{my: 4}}/>

                <Box sx={{mb: 4}}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Typography variant="h5" sx={{fontWeight: 600}}>
                                Rozkład pomieszczeń
                            </Typography>
                            <Select
                                value={selectedFloor}
                                onChange={(e) => handleChangeFloor(e)}
                                size="small"
                                sx={{
                                    minWidth: 120,
                                    backgroundColor: theme.palette.background.paper
                                }}
                            >
                                {location.floors.sort((a, b) => a.floor_number - b.floor_number) // upewnij się, że są posortowane
                                    .map(floor => (
                                        <MenuItem key={floor?.floor_id} value={floor?.floor_id}>
                                            Piętro {floor?.floor_number}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </Box>

                        {layout.length > 0 && (<Button
                            variant="outlined"
                            startIcon={<Schema/>}
                            sx={{
                                px: 3,
                                py: 1
                            }}
                            onClick={() => {
                                navigate("/editor", {
                                    state: {
                                        floorId: selectedFloor,
                                        layout: layout,
                                    }
                                });
                            }}
                        >
                            Tryb edycji
                        </Button>)}
                    </Box>

                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: theme.palette.background.default
                        }}
                    >
                        <LayoutViewer layout={layout} floorId={selectedFloor}/>
                    </Paper>
                </Box>
            </BuildingCard>

            <Dialog
                open={openNotes}
                onClose={()=>setOpenNotes(false)}
                maxWidth="sm"
                fullWidth
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '70vh',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            position: 'sticky',
                            top: 0,
                            background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.9))',
                            zIndex: 1,
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="h6" fontWeight={600}>
                            Uwagi
                        </Typography>
                        <IconButton onClick={()=>setOpenNotes(false)} sx={{color: 'text.secondary'}}>
                            <Close/>
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            p: 3,
                            pt: 2,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px'
                            }
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                textAlign: 'justify',
                                lineHeight: 1.6,
                                color: 'text.secondary',
                                whiteSpace: 'pre-line',
                                '& p': {marginBottom: 2},
                                '& a': {
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {textDecoration: 'underline'}
                                }
                            }}
                        >
                            {location.regards}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            position: 'sticky',
                            bottom: 0,
                            background: 'linear-gradient(to top, #ffffff, rgba(255,255,255,0.9))',
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}
                    >
                        <Button
                            onClick={()=>setOpenNotes(false)}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'}
                            }}
                        >
                            Zamknij
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            <MapDialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                location={formData.lat && formData.lng ? {lat: formData.lat, lng: formData.lng} : null}
                setLocation={handleLocationChange}
            />

            <Dialog
                open={open}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Potwierdzenie usunięcia"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Czy na pewno chcesz usunąć ten budynek? Tej operacji nie można cofnąć.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default BuildingPage;