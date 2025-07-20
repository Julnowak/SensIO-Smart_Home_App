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
    Tab
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
    Settings, Business, EventNote, Room, InfoOutlined, RuleFolderOutlined, AddCircleOutline
} from '@mui/icons-material';
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";


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

    // Mock device data
    const [devices, setDevices] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [rules, setRules] = useState([]);

    // WebSocket setup
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

    return (
        <Box sx={{p: 3, maxWidth: 1400, mx: 'auto'}}>
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                gap: 2
            }}>
                <Box>
                    <Typography variant="h3" component="h1" fontWeight={700}>
                        {room.name}
                    </Typography>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 1}}>

                        <Chip
                            icon={<MeetingRoom fontSize="small"/>}
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

                        <Box sx={{display: 'flex', alignItems: 'center', ml: 1}}>
                            {wsStatus === 'connected' ? (
                                <Wifi color="success" fontSize="small"/>
                            ) : (
                                <WifiOff color="error" fontSize="small"/>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ml: 1}}>
                                {wsStatus.charAt(0).toUpperCase() + wsStatus.slice(1)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Tooltip title="Odśwież">
                        <IconButton onClick={() => fetchRoom()} color="primary">
                            <Refresh/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{mb: 3}}
            >
                <Tab label="Ogólne" icon={<Sensors/>}/>
                <Tab label="Urządzenia" icon={<Lightbulb/>}/>
                <Tab label="Analityka" icon={<Timeline/>}/>
                <Tab label="Zasady" icon={<EventNote/>}/>
                <Tab label="Historia" icon={<History/>}/>
            </Tabs>

            {/* Main Content */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <StatusCard>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Avatar sx={{bgcolor: 'success.light', color: 'success.main', mr: 2}}>
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

                    <Grid item xs={12} md={4}>
                        <StatusCard>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Avatar sx={{bgcolor: 'warning.light', color: 'warning.main', mr: 2}}>
                                        <EnergySavingsLeaf/>
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Energy Usage Today
                                        </Typography>
                                        <Typography variant="h4">
                                            {energyUsage.today} kWh
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="caption" color="text.secondary">
                                        Week: {energyUsage.week} kWh
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Month: {energyUsage.month} kWh
                                    </Typography>
                                </Box>
                            </CardContent>
                        </StatusCard>
                    </Grid>
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
                        <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                            Wszystkie urządzenia
                        </Typography>

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
                                                    Last active: {new Date(device.lastUpdated).toLocaleTimeString()}
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
                <Box>
                    <Typography variant="h5" gutterBottom sx={{mb: 3}}>
                        Analityka
                    </Typography>
                    <Paper sx={{p: 3, borderRadius: 3, minHeight: 400}}>
                        <Typography color="text.secondary">
                            Energy analytics coming soon
                        </Typography>
                    </Paper>
                </Box>
            )}

            {activeTab === 3 && (devices.length === 0 ? (
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
                        Brak zasad do wyświetlenia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Dodaj zasady aby móc je przeglądać
                    </Typography>
                </Box>
            ):(
                <Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutline/>}
                            onClick={() => setOpenDialog(true)}
                        >
                            Nowa zasada
                        </Button>
                    </Box>
                    <Paper sx={{p: 3, borderRadius: 3, minHeight: 400}}>
                        <Typography color="text.secondary">
                            Security settings coming soon
                        </Typography>
                    </Paper>
                </Box>
            ))}

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
    );
};

export default RoomPage;