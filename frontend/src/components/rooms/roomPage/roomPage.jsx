import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Paper,
    Switch,
    Typography,
    styled,
    Chip,
    Avatar,
    Divider,
    Badge,
    LinearProgress,
    Tooltip,
    Tabs,
    Tab, Container, FormControlLabel
} from '@mui/material';
import {
    Lightbulb,
    Warning,
    Lock,
    Thermostat,
    DoorFront,
    Refresh,
    Wifi,
    WifiOff,
    Sensors,
    People,
    Air,
    MeetingRoom,
    Security,
    EnergySavingsLeaf,
    MoreVert,
    Timeline,
    History,
    Settings,
    Business,
    EventNote,
    Room,
    InfoOutlined,
    RuleFolderOutlined,
    AddCircleOutline,
    Memory as MemoryIcon,
    Star,
    RefreshOutlined, EditOutlined, Layers, ExpandLess, ExpandMore, ListAlt, BarChartOutlined, Info
} from '@mui/icons-material';
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";
import AlarmsTab from "../../tabs/alarmsTab.jsx";
import {lightGreen} from "@mui/material/colors";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import RulesTab from "../../tabs/rulesTab.jsx";
import RulesTabLR from "../../tabs/rulesTabLR.jsx";
import RoomEditDialog from "./roomEditDialog.jsx";


const StatusCard = styled(Card)(({theme}) => ({
    borderRadius: theme.shape.borderRadius * 2,
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[6]
    }
}));

const DeviceCard = styled(Paper)(({theme, active}) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    borderLeft: `4px solid ${active ? theme.palette.success.main : theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    }
}));

const RoomPage = () => {
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wsStatus, setWsStatus] = useState('connecting');
    const [activeTab, setActiveTab] = useState(0);
    const [energyUsage, setEnergyUsage] = useState({
        today: 15.2,
        week: 102.5,
        month: 420.8
    });
    const token = localStorage.getItem("access");
    const params = useParams();
    const navigate = useNavigate()

    const [devices, setDevices] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const [rules, setRules] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const [ws, setWs] = useState(null);

    useEffect(() => {
        const newWs = new WebSocket(`ws://127.0.0.1:8000/ws/room_updates/${params.id}/`);
        setWs(newWs);

        return () => newWs.close();
    }, [params]);

    useEffect(() => {
        if (!ws) return;

        ws.onopen = () => {
            console.log("WebSocket connected");
            setWsStatus('connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message:', data);
            if (data.type === 'state_update') {
                setRoom(prev => ({...prev, ...data.data}));
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setWsStatus('error');
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setWsStatus('disconnected');
        };
    }, [ws]);

    const fetchRoom = async () => {
        try {
            const response = await client.get(`${API_BASE_URL}room/${params.id}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setRoom(response.data.roomData);
            setDevices(response.data.devicesData)
            setSensors(response.data.sensorsData)
            setRules(response.data.rulesData)
            setAlarms(response.data.actionsData)

        } catch (error) {
            console.error("Failed to fetch room data", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial room data
    useEffect(() => {
        if (token) fetchRoom();
    }, [token, params]);

    const handleDeviceToggle = async (deviceId) => {
        const response = await client.post(API_BASE_URL + `device/${deviceId}/`,
            {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        let d = response.data;
        setDevices(prevDevices =>
            prevDevices.map(dev =>
                dev.device_id === d.device_id ? d : dev
            )
        );
    };

    if (loading || !room) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60}/>
            </Box>
        );
    }

    function handleRefresh() {
        fetchRoom()
    }

    const handleToggleFavorite = async () => {
        try {
            const response = await client.put(`${API_BASE_URL}room/${params.id}/`, {
                isFavorite: !room.isFavorite,
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setRoom(response.data);
        } catch (error) {
            console.error("Błąd podczas odświeżania danych:", error);
        }
    };

    const handleSave = async () => {

    }


    const energySensors = sensors.filter((s) => s.data_type === "ENERGY")
    const lightSensors = sensors.filter((s) => s.data_type === "LIGHT")
    const temperatureSensors = sensors.filter((s) => s.data_type === "TEMPERATURE")

    return (
        <Container maxWidth="xl">
            <Box sx={{p: 3}}>
                <Box sx={{
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
                }}>
                    {/* Lewa sekcja - avatar i podstawowe informacje */}
                    <Box sx={{display: 'flex', gap: 3, flex: 1}}>
                        <Badge
                            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                            badgeContent={" "}
                            invisible={!room?.isActive}
                            sx={{
                                '& .MuiBadge-badge': {
                                    transform: 'scale(1) translate(5%, 5%)',
                                    backgroundColor: lightGreen[600],
                                    border: "1px solid green"
                                }
                            }}
                        >
                            <Avatar sx={{
                                width: 80,
                                height: 80,
                                bgcolor: room?.color || 'primary.main',
                                color: 'primary.contrastText',
                                fontSize: 32,
                                position: 'relative'
                            }}>
                                <MeetingRoom fontSize="inherit"/>
                            </Avatar>
                        </Badge>

                        <Box sx={{flex: 1}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                mb: 1
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Typography variant="h4" fontWeight={600}>
                                        {room?.name || 'Ładowanie...'}
                                    </Typography>
                                    <IconButton
                                        onClick={handleToggleFavorite}
                                        size="small"
                                        sx={{
                                            color: room?.isFavorite ? 'warning.main' : 'text.disabled',
                                            '&:hover': {
                                                color: 'warning.main'
                                            }
                                        }}
                                    >
                                        <Star fontSize="small"/>
                                    </IconButton>
                                </Box>

                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Tooltip title="Odśwież">
                                        <IconButton
                                            onClick={handleRefresh}
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                }
                                            }}
                                        >
                                            <RefreshOutlined fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edytuj">
                                        <IconButton
                                            // onClick={() => {
                                            //     setOpenDeviceModal(!openDeviceModal);
                                            //     setFormDataDevice({
                                            //         ...device,
                                            //         location: device?.location.home_id,
                                            //         floor: device.floor ? device.floor.floor_id : device.floor,
                                            //         room: device.room ? device.room.room_id : device.room
                                            //     });
                                            // }}
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                }
                                            }}
                                        >
                                            <EditOutlined fontSize="small" onClick={()=> setOpenModal(!openModal)}/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Typography color="text.secondary" sx={{mb: 2}}>
                                Ostatnia
                                aktywność: {room?.lastUpdated ? format(new Date(room?.lastUpdated), "PPpp", {locale: pl}) : format(new Date(), "PPpp", {locale: pl})}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                                    <Chip
                                        icon={<Layers fontSize="small"/>}
                                        label={`Piętro ${room?.floor?.floor_number || 'N/A'}`}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                    <Chip
                                        icon={<Business fontSize="small"/>}
                                        onClick={() => navigate(`/home/${room?.home.home_id}`)}
                                        label={room?.home?.name || 'N/A'}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Paper elevation={0}
                       sx={{
                           width: "100%",
                           border: "1px solid #00000020",
                           borderRadius: 2,
                           overflow: 'hidden',
                           mt: 2,
                           mb: 2
                       }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Czuniki" icon={<Sensors/>}/>
                        <Tab label="Urządzenia" icon={<Lightbulb/>}/>
                        <Tab label="Alarmy" icon={<Warning/>}/>
                        <Tab label="Zasady" icon={<EventNote/>}/>
                        <Tab label="Wykresy" icon={<Timeline/>}/>
                    </Tabs>
                </Paper>


                {/* Main Content */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>

                        {temperatureSensors.length > 0 && (
                            <Grid size={{xs: 12, md: 4}}>
                                <StatusCard sx={{border: "1px solid #00000020",}}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <Avatar sx={{bgcolor: 'error.light', color: 'black', mr: 2}}>
                                                <Thermostat/>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Aktualna temperatura
                                                </Typography>
                                                <Typography variant="h4">
                                                    {room.temperature || 'N/A'}°C
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography variant="caption" color="text.secondary">
                                                Setpoint: 22°C
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Humidity: {room.humidity || 'N/A'}%
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </StatusCard>
                            </Grid>
                        )}


                        {lightSensors.length > 0 && (
                            <Grid size={{xs: 12, md: 4}}>
                                <StatusCard sx={{border: "1px solid #00000020", bgcolor: "rgba(255,195,0,0.31)"}}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <Avatar sx={{bgcolor: 'warning.light', color: 'black', mr: 2}}>
                                                <Lightbulb/>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Oświetlenie
                                                </Typography>
                                                <Typography variant="h4">
                                                    {room.light ? "ON" : "OFF"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography variant="caption" color="text.secondary">
                                                Setpoint: 22°C
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Humidity: {room.humidity || 'N/A'}%
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </StatusCard>
                            </Grid>)}

                        {energySensors.length > 0 && (
                            <Grid size={{xs: 12, md: 4}}>
                                <StatusCard sx={{border: "1px solid #00000020",}}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <Avatar sx={{bgcolor: 'success.light', color: 'black', mr: 2}}>
                                                <EnergySavingsLeaf/>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Aktualne zużycie energii
                                                </Typography>
                                                <Typography variant="h4">
                                                    {energyUsage.today} kWh
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography variant="caption" color="text.secondary">
                                                Tygodniowe: {energyUsage.week} kWh
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Miesięczne: {energyUsage.month} kWh
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </StatusCard>
                            </Grid>
                        )}

                        {lightSensors.length === 0 && temperatureSensors.length === 0 && energySensors.length === 0 && (
                            <Grid size={{xs: 12}}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minHeight: '300px',
                                        textAlign: 'center',
                                        p: 3,
                                        borderRadius: 1,
                                    }}
                                >
                                    <InfoOutlined color="disabled" sx={{fontSize: 48, mb: 2}}/>
                                    <Typography variant="h6" color="text.secondary">
                                        Brak czujników przypisanych do pokoju
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Przypisz pokój do czujników, a dane o odczytach pojawią się w tym miejscu.
                                    </Typography>
                                </Box>
                            </Grid>
                        )}


                    </Grid>
                )}

                {activeTab === 1 && (devices.length === 0 ? (
                    <Box mt={0.5} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        textAlign: 'center'

                    }}>
                        <InfoOutlined color="disabled" sx={{fontSize: 48, mb: 2}}/>
                        <Typography variant="h6" color="text.secondary">
                            Brak urządzeń do wyświetlenia
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Dodaj urządzenie i wróć ponownie
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12}}>
                            <Grid container spacing={3}>
                                {devices?.map(device => (
                                    <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={device.device_id}>
                                        <DeviceCard active={device.isActive}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                <Box sx={{cursor: "pointer"}}
                                                     onClick={() => navigate(`/device/${device.device_id}`)}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {device.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Ostatnio
                                                        aktywne: {new Date(device.lastUpdated).toLocaleTimeString()}
                                                    </Typography>
                                                </Box>
                                                <Switch
                                                    checked={device.isActive}
                                                    onChange={() => handleDeviceToggle(device.device_id)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                        </DeviceCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                ))}

                {activeTab === 2 && (
                    <AlarmsTab alarms={alarms}/>
                )}

                {activeTab === 3 && (
                    <RulesTabLR rules={rules} sensors={sensors} setRules={setRules} devices={devices} rooms={[room]} type={"room"}/>
                )}

                {activeTab === 4 && (
                    <Box>
                        <Typography variant="h5" gutterBottom sx={{mb: 3}}>
                            Historia
                        </Typography>
                        <Paper sx={{p: 3, borderRadius: 3, minHeight: 400}}>
                            <Typography color="text.secondary">
                                Room configuration coming soon
                            </Typography>
                        </Paper>
                    </Box>
                )}
            </Box>

            <RoomEditDialog room={room} onClose={()=> setOpenModal(!openModal)} open={openModal} homes={[]} floors={[]} onSave={handleSave}/>
        </Container>
    );
};

export default RoomPage;