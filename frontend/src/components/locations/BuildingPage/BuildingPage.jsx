import React, {useState, useEffect} from "react";
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";
import {useNavigate, useParams} from "react-router-dom";
import LayoutViewer from "../../layoutViewer/layoutViewer.jsx";
import {
    Home,
    LocationOn,
    Notes,
    Layers,
    Schema,
    Map,
    Delete,
    Close,
    Warning,
    ListAlt,
    BarChartOutlined,
    Memory as MemoryIcon,
    Star,
    RefreshOutlined,
    EditOutlined,
    Archive, Unarchive, Check, HomeWork, SquareFoot, CalendarToday
} from "@mui/icons-material";
import {
    Box,
    Button,
    Container,
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
    DialogTitle,
    DialogContentText,
    Tabs,
    Tab,
    Badge,
    Avatar,
    Tooltip,
} from "@mui/material";
import {MapContainer, TileLayer, Marker, useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import AlarmsTab from "../../tabs/alarmsTab.jsx";
import {lightGreen} from "@mui/material/colors";
import CalendarChart from "../heatmap.jsx";
import RulesTabLR from "../../tabs/rulesTabLR.jsx";


const InfoItem = ({icon, label, value}) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        minHeight: 40
    }}>
        {React.cloneElement(icon, {fontSize: 'small'})}
        <Typography variant="body1">
            <Box component="span" sx={{fontWeight: 500}}>{label}</Box> {value}
        </Typography>
    </Box>
);

const LocationMarker = ({location, setLocation}) => {
    const map = useMapEvents({
        click(e) {
            setLocation({
                lat: e.latlng.lat, lng: e.latlng.lng
            });
        },
    });

    return location === null ? null : (<Marker
        position={[location.lat, location.lng]}
        draggable={true}
        eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setLocation({
                    lat: position.lat, lng: position.lng
                });
            },
        }}
    />);
};

const MapDialog = ({open, onClose, location, setLocation}) => {
    const [tempLocation, setTempLocation] = useState(location);

    const handleSave = () => {
        setLocation(tempLocation);
        onClose();
    };

    return (<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
    </Dialog>);
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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [openEdit, setOpenEdit] = useState(false);
    const [alarms, setAlarms] = useState([]);
    const [rules, setRules] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [devices, setDevices] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [measurements, setMeasurements] = useState([]);

    const token = localStorage.getItem("access");
    const params = useParams();
    const [openNotes, setOpenNotes] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await client.get(API_BASE_URL + "home/" + params.id, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                const homeData = response.data.homeData;
                setLocation(homeData);
                setFormData(homeData);
                setLayout(response.data.roomsData);
                setAlarms(response.data.alarmsData);
                setMeasurements(response.data.measurementsData);
                setSelectedFloor(homeData.floors[0].floor_id);
                setFloors(homeData.floors)
                setRooms(homeData.rooms)
                setSensors(response.data.sensorsData)
                setDevices(response.data.devicesData)
                setRules(response.data.rulesData)

            } catch (error) {
                console.error("Error fetching location:", error);
            } finally {
                setLoading(false)
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
            setLayout((prevLayout) => prevLayout.map((room) => room.room_id === data.room_id ? {
                ...room,
                light: data.light
            } : room));
        };

        return () => ws.close();
    }, [params.id]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSave = async () => {
        setIsEditing(false);
        try {
            setLoading(true)
            const response = await client.put(API_BASE_URL + "home/" + params.id + "/",
                formData,{
                headers: {Authorization: `Bearer ${token}`}
            });

            const homeData = response.data;
            setLocation(homeData);
        } catch (error) {
            console.error("Error fetching location:", error);
        } finally {
            setLoading(false)
        }
    };

    const handleChangeFloor = async (e) => {
        setSelectedFloor(e.target.value)
        const response = await client.get(API_BASE_URL + "home/" + params.id, {
            headers: {Authorization: `Bearer ${token}`}, params: {floorId: e.target.value},
        });
        setLayout(response.data.roomsData);
    };

    const handleLocationChange = (newLocation) => {
        setFormData(prev => ({
            ...prev, lat: newLocation.lat, lng: newLocation.lng
        }));
    };

    if (!location) {
        return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60}/>
        </Box>);
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


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    function handleRefresh() {

    }

    const handleToggleFavorite = () => {

    };

    return (<Container maxWidth="xl">
        <Box sx={{pt: 3}}>
            <Box
                sx={{
                    p: 3,
                    mb: 2,
                    border: "1px solid #00000020",
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    gap: 3,
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)'
                    }
                }}
            >
                <Badge
                    anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                    badgeContent={<Check fontSize="small"/>}
                    invisible={!location?.current}
                    sx={{
                        '& .MuiBadge-badge': {
                            transform: 'scale(1) translate(1%, 1%)',
                            backgroundColor: lightGreen[600],
                            border: "1px solid green",
                            borderRadius: '50%', // Makes it circular
                            width: 25,
                            height: 25,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }
                    }}
                >
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            color: 'primary.contrastText',
                            fontSize: 32,
                            position: 'relative',
                            '& img': {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0
                            }
                        }}
                    >
                        <img src={location.image?.slice(15)} alt={location?.name || 'Location image'}/>
                    </Avatar>
                </Badge>

                <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 2,
                            mb: 1
                        }}
                    >
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                <Typography variant="h4" fontWeight={600}>
                                    {location?.name || 'Ładowanie...'}
                                </Typography>
                                <IconButton
                                    onClick={handleToggleFavorite}
                                    size="small"
                                    sx={{
                                        color: location?.isFavorite ? 'warning.main' : 'text.disabled', '&:hover': {
                                            color: 'warning.main'
                                        }
                                    }}
                                >
                                    <Star fontSize="small"/>
                                </IconButton>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                {location?.address || 'Brak adresu'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                                Ostatnia
                                aktywność: {location?.lastUpdated ? format(new Date(location?.lastUpdated), "PPpp", {locale: pl}) : format(new Date(), "PPpp", {locale: pl})}
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Tooltip title="Odśwież">
                                <IconButton
                                    onClick={handleRefresh}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary', '&:hover': {
                                            color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    <RefreshOutlined fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edytuj">
                                <IconButton
                                    onClick={() => setOpenEdit(!openEdit)}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary', '&:hover': {
                                            color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    <EditOutlined fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                            {!location.isArchived ?
                                <Tooltip title="Archiwizuj">
                                    <IconButton
                                        onClick={() => handleOpenDialog(location.home_id)}
                                        size="small"
                                        sx={{
                                            color: 'text.secondary', '&:hover': {
                                                color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                            }
                                        }}
                                    >
                                        <Archive fontSize="small"/>
                                    </IconButton>
                                </Tooltip> :
                                <Tooltip title="Przywróć">
                                    <IconButton
                                        onClick={() => handleOpenDialog(location.home_id)}
                                        size="small"
                                        sx={{
                                            color: 'text.secondary', '&:hover': {
                                                color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                            }
                                        }}
                                    >
                                        <Unarchive fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            }

                            <Tooltip title="Usuń">
                                <IconButton
                                    onClick={() => handleOpenDialog(location.home_id)}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary', '&:hover': {
                                            color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    <Delete fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>


        <Paper elevation={0}
               sx={{
                   width: "100%", border: "1px solid #00000020", borderRadius: 2, overflow: 'hidden', mt: 2,
               }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab label="Ogólne" value={0} icon={<Home/>} iconPosition="start"/>
                <Tab label="Rozmieszczenie" value={1} icon={<Layers/>} iconPosition="start"/>
                <Tab label="Alarmy" value={2} icon={<Warning/>} iconPosition="start"/>
                <Tab label="Zasady" value={3} icon={<ListAlt/>} iconPosition="start"/>
                <Tab label="Wykresy" value={4} icon={<BarChartOutlined/>} iconPosition="start"/>
            </Tabs>
        </Paper>

        {(activeTab === 0 || activeTab === 1) &&
        <Paper elevation={3} sx={{
            width: "100%", border: "1px solid #00000020", borderRadius: 2, overflow: 'hidden', mt: 2, p: 3,
            mb: 3
        }}>
            {activeTab === 0 && (
                <Box sx={{mt: 2}}>
                    <Grid container spacing={3}>
                        {/* Sekcja informacji */}
                        <Grid size={{xs: 12, md: 6}} sx={{alignContent: "center"}}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
                                gap: 2,
                            }}>
                                {/* Informacje o budynku - lewa kolumna */}
                                <Box>
                                    <InfoItem
                                        icon={<Layers color="action"/>}
                                        label="Liczba pięter:"
                                        value={location.floor_num}
                                    />
                                    <InfoItem
                                        icon={<LocationOn color="action"/>}
                                        label="Liczba pomieszczeń:"
                                        value={location.roomsCount || "Nie określono"}
                                    />
                                    <InfoItem
                                        icon={<MemoryIcon color="action"/>}
                                        label="Liczba urządzeń:"
                                        value={location.activeDevices || "Nie określono"}
                                    />
                                </Box>

                                {/* Informacje o budynku - prawa kolumna */}
                                <Box>
                                    <InfoItem
                                        icon={<CalendarToday color="action"/>}
                                        label="Rok budowy:"
                                        value={location.year_of_construction || "Brak danych"}
                                    />
                                    <InfoItem
                                        icon={<SquareFoot color="action"/>}
                                        label="Powierzchnia budynku:"
                                        value={location.building_area ? `${location.building_area} m²` : "Brak danych"}
                                    />
                                    <InfoItem
                                        icon={<HomeWork color="action"/>}
                                        label="Typ budynku:"
                                        value={location.building_type || "Nieznany"}
                                    />
                                </Box>
                            </Box>

                            {location.notes && (
                                <Button
                                    onClick={() => setOpenNotes(true)}
                                    variant="outlined"
                                    startIcon={<Notes/>}
                                    sx={{mt: 2}}
                                >
                                    Zobacz uwagi
                                </Button>
                            )}
                        </Grid>

                        {/* Sekcja mapy */}
                        <Grid size={{xs: 12, md: 6}}>
                            {location.lat && location.lng ? (
                                <Box>
                                    <Typography variant="subtitle1" sx={{mb: 1, display: 'flex', alignItems: 'center'}}>
                                        <LocationOn sx={{mr: 1}}/>
                                        Lokalizacja na mapie
                                    </Typography>
                                    <Box sx={{
                                        height: 300,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
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
                                <Alert
                                    severity="info"
                                    sx={{
                                        mt: 2,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    Lokalizacja nie została ustawiona
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            )}


            {activeTab === 1 && (<Box>
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3
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
                                minWidth: 120, backgroundColor: theme.palette.background.paper
                            }}
                        >
                            {location.floors.sort((a, b) => a.floor_number - b.floor_number) // upewnij się, że są posortowane
                                .map(floor => (<MenuItem key={floor?.floor_id} value={floor?.floor_id}>
                                    Piętro {floor?.floor_number}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    {layout.length > 0 && (<Button
                        variant="outlined"
                        startIcon={<Schema/>}
                        sx={{
                            px: 3, py: 1
                        }}
                        onClick={() => {
                            navigate("/editor", {
                                state: {
                                    floorId: selectedFloor, layout: layout,
                                }
                            });
                        }}
                    >
                        Tryb edycji
                    </Button>)}
                </Box>
                <LayoutViewer layout={layout} floorId={selectedFloor}/>
            </Box>)}

        </Paper>}

        <Box sx={{mt:2}}>
        {activeTab === 2 && (<AlarmsTab alarms={alarms} setAlarms={setAlarms} loading={loading}/>)}
        </Box>

        {activeTab === 3 && (<RulesTabLR rules={rules} setRules={setRules} floors={floors} rooms={rooms} sensors={sensors} devices={devices} type={"location"}
        locations={[location]}/>)}
        {activeTab === 4 && measurements.length !== 0 && (
            <Box>
                <Grid size={{sx: 12}}>
                    <CalendarChart measurements={measurements}/>
                </Grid>
            </Box>
        )}



        <Dialog
            open={openNotes}
            onClose={() => setOpenNotes(false)}
            maxWidth="sm"
            fullWidth
        >
            <Box
                sx={{
                    display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflow: 'hidden'
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
                    <IconButton onClick={() => setOpenNotes(false)} sx={{color: 'text.secondary'}}>
                        <Close/>
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        p: 3, pt: 2, overflowY: 'auto', '&::-webkit-scrollbar': {
                            width: '6px'
                        }, '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '3px'
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
                        onClick={() => setOpenNotes(false)}
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

        <Dialog
            open={openEdit}
            onClose={()=> setOpenEdit(!openEdit)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Edycja budynku"}</DialogTitle>
            <DialogContent sx>
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
                    </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=> setOpenEdit(!openEdit)}>Anuluj</Button>
                <Button onClick={handleSave} color="error" variant="contained" autoFocus>
                    Zapisz
                </Button>
            </DialogActions>
        </Dialog>

    </Container>);
};

export default BuildingPage;