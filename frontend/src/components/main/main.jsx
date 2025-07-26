import React, {useEffect, useState} from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    useTheme,
    Badge,
    Avatar,
    IconButton,
    Tooltip,
    Container,
    Autocomplete, TextField, Button, Checkbox
} from '@mui/material';
import {
    Thermostat as ThermostatIcon,
    Lightbulb as LightbulbIcon,
    Security as SecurityIcon,
    EnergySavingsLeaf as EnergyIcon,
    DeviceHub as DevicesIcon,
    Timeline as TimelineIcon, Check, Star, RefreshOutlined, EditOutlined, Archive, Unarchive, Delete, Warning,
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {lightGreen} from "@mui/material/colors";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import {useNavigate} from "react-router-dom";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import EnergyCharts from "./energyCharts.jsx";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import {PieChart} from "@mui/x-charts";


const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
}));

const StatCard = ({icon, title, value, subtitle}) => (
    <Item sx={{m: 1, border: "1px solid #00000020",}}>
        <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
            {React.cloneElement(icon, {fontSize: 'large'})}
            <Typography variant="h6" sx={{ml: 1}}>
                {title}
            </Typography>
        </Box>
        <Typography variant="h4" sx={{fontWeight: 'bold'}}>
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
    const navigate = useNavigate()

    const token = localStorage.getItem("access");
    const validLocations = locations?.filter(loc => loc.lat && loc.lng);

    // Oblicz środek mapy na podstawie wszystkich lokalizacji
    const calculateCenter = () => {
        if (validLocations?.length === 0) return [52.237, 19.517]; // Warszawa jako domyślna

        const latSum = validLocations?.reduce((sum, loc) => sum + parseFloat(loc.lat), 0);
        const lngSum = validLocations?.reduce((sum, loc) => sum + parseFloat(loc.lng), 0);

        return [latSum / validLocations?.length, lngSum / validLocations?.length];
    };

    const center = calculateCenter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "main", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            setMeasurements(response.data.measurementsData);
            setLocations(response.data.locationsData);
            setAlarms(response.data.actionsData);
            setLastAlarms(response.data.lastAlarms);

        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [token]);

    const handleRefresh = () => {
        fetchData();
    };

    const handleAcknowledge = async (actionId, isAcknowledged) => {
        // await client.patch(`/api/actions/${actionId}/`, { isAcknowledged });
        // // Refresh data or update local state
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{pt: 3}}>
                <Box
                    sx={{
                        p: 4,
                        border: "1px solid",
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,

                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            mb: 1
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{
                                    color: 'text.primary',
                                    letterSpacing: 0.5
                                }}
                            >
                                Panel główny
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Tooltip title="Odśwież">
                                <IconButton
                                    onClick={handleRefresh}
                                    size="small"
                                    sx={{
                                        color: 'text.secondary',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <RefreshOutlined fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Grid container sx={{mt: 2}}>
                <Grid size={{xs: 6}}>
                    <Paper elevation={3} sx={{height: '500px', width: '100%'}}>
                        <MapContainer
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
                                >
                                    <Popup
                                        closeButton={false}
                                        className="custom-popup"
                                        maxWidth={250}
                                        minWidth={180}
                                    >
                                        <Box sx={{p: 1}}>
                                            <Typography
                                                variant="subtitle1"
                                                component="div"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'primary.main',
                                                }}
                                            >
                                                {location.name}
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <Box sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    bgcolor: parseInt(location.activeDevices[0]) > 0 ? 'success.main' : 'error.main',
                                                    mr: 1.5
                                                }}/>

                                                <Typography variant="body2">
                                                    <Box component="span" sx={{fontWeight: 'bold'}}>
                                                        {location.activeDevices}
                                                    </Box>
                                                    {parseInt(location.activeDevices[0]) === 1 ? ' urządzenie aktywne' : ' urządzeń aktywnych'}
                                                </Typography>
                                            </Box>

                                            <Button variant={"outlined"}
                                                    onClick={() => navigate(`/home/${location.home_id}`)}>
                                                Przejdź na stronę
                                            </Button>
                                        </Box>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Paper>
                </Grid>

                <Grid size={{xs: 6}}>
                    <Box sx={{m: 2}}>


                        <Autocomplete
                            disablePortal
                            id="room-select"
                            options={locations}
                            value={selectedLocation}
                            getOptionLabel={(option) => option ? `${option.name}` : ""}
                            sx={{width: '100%', mt: 2}}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            renderInput={(params) => <TextField {...params} label="Lokacja"/>}
                            onChange={(event, newValue) => {
                                setSelectedLocation(newValue);
                            }}
                        />

                        <Grid container>
                            <Grid size={{xs: 6}} mb={1}>
                                <StatCard
                                    icon={<ThermostatIcon color="error"/>}
                                    title="Temperatura"
                                    value="22.5°C"
                                    subtitle="Średnia w budynku"
                                />
                            </Grid>
                            <Grid size={{xs: 6}} mb={1}>
                                <StatCard
                                    icon={<EnergyIcon color="success"/>}
                                    title="Energia"
                                    value="245 kW"
                                    subtitle="Dzisiejsze zużycie"
                                />
                            </Grid>
                            <Grid size={{xs: 6}} mb={1}>
                                <StatCard
                                    icon={<LightbulbIcon color="warning"/>}
                                    title="Oświetlenie"
                                    value="On"
                                    subtitle="Aktywne/Total"
                                />
                            </Grid>
                            <Grid size={{xs: 6}} mb={1}>
                                <StatCard
                                    icon={<Warning/>}
                                    title="Alarmy"
                                    value="100%"
                                    subtitle="Systemy aktywne"
                                />
                            </Grid>
                        </Grid>

                    </Box>
                </Grid>
            </Grid>

            <Grid container>{measurements?.length !== 0 &&
                (<EnergyCharts measurements={measurements}/>)}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{xs: 12, sm: 6}}>
                    <Paper sx={{p: 3, height: '100%'}}>
                        <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                            Statystyki alarmów
                        </Typography>

                        <Box sx={{height: 300}}>
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

                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-around'}}>
                            <Box sx={{textAlign: 'center'}}>
                                <Typography variant="h5">
                                    {alarms?.filter(a => a.isAcknowledged).length}
                                </Typography>
                                <Typography variant="caption">Potwierdzone</Typography>
                            </Box>
                            <Box sx={{textAlign: 'center'}}>
                                <Typography variant="h5">
                                    {alarms?.filter(a => !a.isAcknowledged).length}
                                </Typography>
                                <Typography variant="caption">Niepotwierdzone</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{xs: 12, sm: 6}}>
                    <Paper sx={{p: 3}}>
                        <Typography variant="h6" gutterBottom sx={{mb: 2}}>
                            Ostatnie alerty ({lastAlarms?.length})
                        </Typography>

                        {lastAlarms?.map((l) => (
                            <Paper
                                key={l.action_id}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: l.isAcknowledged ? 'action.selected' : 'background.paper'
                                }}
                            >
                                {/* Warning icon */}
                                <Box sx={{mr: 2}}>
                                    <Warning
                                        color={
                                            l.status === "HIGH"
                                                ? "error"
                                                : l.status === "MEDIUM"
                                                    ? "warning"
                                                    : "disabled"
                                        }
                                        fontSize="medium"
                                    />
                                </Box>

                                <Box sx={{flexGrow: 1}}>
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
                                    inputProps={{'aria-label': 'Potwierdź alarm'}}
                                />
                            </Paper>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

        </Container>
    );
};

export default Main;