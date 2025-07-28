import React, {useEffect, useState} from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Container,
    Autocomplete,
    TextField,
    Button,
    Checkbox, Link, Dialog, DialogContent, CircularProgress, Backdrop, DialogContentText, Skeleton
} from '@mui/material';
import {
    Thermostat as ThermostatIcon,
    Lightbulb as LightbulbIcon,
    EnergySavingsLeaf as EnergyIcon,
    RefreshOutlined,
    Warning, CheckCircle,
} from '@mui/icons-material';
import {styled, useTheme} from '@mui/material/styles';
import {useNavigate} from "react-router-dom";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import EnergyCharts from "./energyCharts.jsx";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import {PieChart} from "@mui/x-charts";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
}));

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


const StatCard = ({icon, title, value, subtitle}) => (
    <Item sx={{
        border: "1px solid #00000020",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        p: 2,
    }}>
        <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
            {React.cloneElement(icon, {fontSize: 'large'})}
            <Typography variant="h6" sx={{ml: 1}}>
                {title}
            </Typography>
        </Box>
        <Typography variant="h4" sx={{fontWeight: 'bold', my: 1}}>
            {value}
        </Typography>
        <Typography variant="caption" color="textSecondary">
            {subtitle}
        </Typography>
    </Item>
);

const Main = () => {
    const [loading, setLoading] = useState(true);
    const [measurements, setMeasurements] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [lastAlarms, setLastAlarms] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();
    const [info, setInfo] = useState({});

    const token = localStorage.getItem("access");
    const validLocations = locations?.filter(loc => loc.lat && loc.lng);

    const calculateCenter = () => {
        if (validLocations?.length === 0) return [52.237, 19.517];
        const latSum = validLocations?.reduce((sum, loc) => sum + parseFloat(loc.lat), 0);
        const lngSum = validLocations?.reduce((sum, loc) => sum + parseFloat(loc.lng), 0);
        return [latSum / validLocations?.length, lngSum / validLocations?.length];
    };

    const center = calculateCenter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "main", {
                headers: {Authorization: `Bearer ${token}`}
            });
            setMeasurements(response.data.measurementsData);
            setLocations(response.data.locationsData);
            setSelectedLocation(response.data.locationsData.filter((f) => f.current === true)[0])
            setAlarms(response.data.actionsData);
            setLastAlarms(response.data.lastAlarms);
            setInfo(response.data.info)
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleRefresh = () => fetchData();
    const handleAcknowledge = async (actionId, isAcknowledged) => {
        await client.put(API_BASE_URL + `action/${actionId}/`,
            {
                isAcknowledged: isAcknowledged,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setLastAlarms((prev) => prev.map((a) => a.action_id === actionId ? {
            ...a,
            isAcknowledged: !a.isAcknowledged
        } : a));

        setAlarms((prev) => prev.map((a) => a.action_id === actionId ? {
            ...a,
            isAcknowledged: !a.isAcknowledged
        } : a));
    };

    const handleLocationChange = async (event, newValue) => {
        setSelectedLocation(newValue);
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "main", {
                headers: {Authorization: `Bearer ${token}`},
                params: {
                    cur: newValue.home_id
                }
            });
            setMeasurements(response.data.measurementsData);
            setLocations(response.data.locationsData);
            setAlarms(response.data.actionsData);
            setLastAlarms(response.data.lastAlarms);
            setInfo(response.data.info)
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }


    };
    return (
        <Container maxWidth="xl" sx={{py: 3}}>

            <Paper elevation={3} sx={{p: 3, mb: 3}}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={700}>
                        Panel główny
                    </Typography>
                    <Tooltip title="Odśwież">
                        <IconButton onClick={handleRefresh}>
                            <RefreshOutlined/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {loading ? (
                <Skeleton variant="rectangular" height={500} sx={{mb: 3, borderRadius: 2}}/>
            ) : (
                measurements?.length !== 0 && (<EnergyCharts measurements={measurements}/>)
            )}

            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 6}}>
                    <Paper elevation={3} sx={{height: '500px', width: '100%'}}>
                        {loading ? (
                            <Skeleton variant="rectangular" height="100%"/>
                        ) : (<MapContainer
                            center={center}
                            zoom={6}
                            style={{height: '100%', width: '100%', borderRadius: '4px'}}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />

                            {validLocations?.map((location, index) => (
                                <Marker
                                    key={`marker-${index}`}
                                    position={[parseFloat(location.lat), parseFloat(location.lng)]}
                                    icon={location.home_id === selectedLocation?.home_id ? redIcon : new L.Icon.Default()}
                                >
                                    <Popup closeButton={true}>
                                        <Box sx={{p: 1}}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                {location.name}
                                            </Typography>
                                            <Box display="flex" alignItems="center" my={1}>
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        bgcolor:
                                                            parseInt(location.activeDevices[0]) > 0
                                                                ? 'success.main'
                                                                : 'error.main',
                                                        mr: 1.5,
                                                    }}
                                                />
                                                <Typography variant="body2">
                                                    <Box component="span" fontWeight="bold">
                                                        {location.activeDevices}
                                                    </Box>
                                                    {parseInt(location.activeDevices[0]) === 1
                                                        ? ' urządzenie aktywne'
                                                        : ' urządzeń aktywnych'}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate(`/home/${location.home_id}`)}
                                                fullWidth
                                            >
                                                Przejdź na stronę
                                            </Button>
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>)}

                    </Paper>
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                    <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                        {loading ? (
                            <>
                                <Skeleton variant="rectangular" height={60} sx={{mb: 2, borderRadius: 1}}/>
                                <Grid container spacing={2}>
                                    {Array(4).fill(0).map((_, i) => (
                                        <Grid size={{xs: 6}} key={i}>
                                            <Skeleton variant="rectangular" height={140} sx={{borderRadius: 2}}/>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Autocomplete
                                    disablePortal
                                    options={locations}
                                    value={selectedLocation}
                                    getOptionLabel={(option) => option?.name || ""}
                                    sx={{width: '100%', mb: 1}}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                    renderInput={(params) => <TextField {...params} label="Lokacja"/>}
                                    onChange={(event, newValue) => handleLocationChange(event, newValue)}
                                />

                                <Grid container spacing={2} sx={{height: "100%", justifyItems: "center"}}>
                                    {[
                                        {
                                            icon: <ThermostatIcon color="error"/>,
                                            title: "Temperatura",
                                            value: info['temp'] || "---",
                                            subtitle: "Średnia w budynku"
                                        },
                                        {
                                            icon: <EnergyIcon color="success"/>,
                                            title: "Zużycie energii",
                                            value: `${info['energy']} kW` || "---",
                                            subtitle: "Dzisiejsze zużycie"
                                        },
                                        {
                                            icon: <LightbulbIcon color="warning"/>,
                                            title: "Oświetlenie",
                                            value: info['light'] || "---",
                                            subtitle: "Zapalone / Wszystkie"
                                        },
                                        {
                                            icon: <Warning color="error"/>,
                                            title: "Alarmy",
                                            value: info['alarms'] || "---",
                                            subtitle: "Oznaczone / Wszystkie"
                                        }
                                    ].map((stat, index) => (
                                        <Grid size={{xs: 6}} key={index}>
                                            <StatCard {...stat} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{mt: 2, mb: 4}}>
                <Grid size={{xs: 12, md: 6}}>
                    <Typography variant="h5" gutterBottom>
                        Ostatnie alerty ({lastAlarms?.length})
                    </Typography>
                    {lastAlarms?.map((l) => (
                        <Paper key={l.action_id} sx={{p: 2, mb: 2}}>
                            <Box display="flex" alignItems="center">
                                <Warning
                                    color={
                                        l.status === "HIGH" ? "error" :
                                            l.status === "MEDIUM" ? "warning" : "disabled"
                                    }
                                    sx={{mr: 2}}
                                />
                                <Box flexGrow={1}>
                                    <Typography variant="subtitle2">
                                        {l.description || `Alarm ${l.action_id}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(l.created_at).toLocaleString()} • {l.type === 'AUTO' ? 'Automatyczny' : 'Ręczny'}
                                    </Typography>
                                </Box>
                                <Checkbox
                                    checked={l.isAcknowledged}
                                    onChange={(e) => handleAcknowledge(l.action_id, e.target.checked)}
                                    color="primary"
                                />
                            </Box>

                        </Paper>
                    ))}

                    <Grid size={{xs: 12}} sx={{textAlign: "right"}}>
                        <Link onClick={() => navigate("/history")}>
                            Zobacz więcej...
                        </Link>
                    </Grid>

                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                    <Typography variant="h5" gutterBottom>
                        Statystyki alarmów
                    </Typography>
                    <Paper sx={{p: 2}}>
                        <Box sx={{height: 360}}>
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            {
                                                id: 0,
                                                value: alarms?.filter(a => a.status === 'HIGH').length,
                                                label: 'Wysokie',
                                                color: "#da1212"
                                            },
                                            {
                                                id: 1,
                                                value: alarms?.filter(a => a.status === 'MEDIUM').length,
                                                label: 'Średnie',
                                                color: "#fa751d"
                                            },
                                            {
                                                id: 2,
                                                value: alarms?.filter(a => a.status === 'LOW').length,
                                                label: 'Niskie',
                                                color: "#ffbe2d"
                                            },
                                        ],
                                        innerRadius: 50,
                                        outerRadius: 100,
                                        paddingAngle: 5,
                                        cornerRadius: 5,
                                        colors: ['#ff0000', '#ffa500', '#222222']
                                    }
                                ]}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={loading}
                aria-labelledby="loading-modal-title"
                aria-describedby="loading-modal-description"
                BackdropComponent={Backdrop}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(3px)'
                    }
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        padding: 3,
                        minWidth: 300,
                        textAlign: 'center'
                    }
                }}
            >
                <DialogContent>
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: theme.palette.info.main,
                            mb: 2
                        }}
                    />
                    <DialogContentText
                        id="loading-modal-description"
                        sx={{
                            fontSize: '1.1rem',
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <CheckCircle
                            fontSize="medium"
                            color="success"
                            sx={{
                                verticalAlign: 'middle',
                                mr: 1
                            }}
                        />
                        Trwa ładowanie strony. Proszę czekać...
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Main;