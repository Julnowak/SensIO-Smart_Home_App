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
    Autocomplete, TextField
} from '@mui/material';
import {
    Thermostat as ThermostatIcon,
    Lightbulb as LightbulbIcon,
    Security as SecurityIcon,
    EnergySavingsLeaf as EnergyIcon,
    DeviceHub as DevicesIcon,
    Timeline as TimelineIcon, Check, Star, RefreshOutlined, EditOutlined, Archive, Unarchive, Delete,
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


const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
}));

const StatCard = ({icon, title, value, subtitle}) => (
    <Item>
        <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
            {React.cloneElement(icon, {fontSize: 'large', color: 'primary'})}
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
    const navigate = useNavigate()

    const token = localStorage.getItem("access");
     const validLocations = locations.filter(loc => loc.lat && loc.lng);

      // Oblicz środek mapy na podstawie wszystkich lokalizacji
      const calculateCenter = () => {
        if (validLocations.length === 0) return [52.237, 21.017]; // Warszawa jako domyślna

        const latSum = validLocations.reduce((sum, loc) => sum + parseFloat(loc.lat), 0);
        const lngSum = validLocations.reduce((sum, loc) => sum + parseFloat(loc.lng), 0);

        return [latSum / validLocations.length, lngSum / validLocations.length];
      };

      const center = calculateCenter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "main", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMeasurements(response.data.measurementsData);
            setLocations(response.data.locationsData);

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

    return (
        <Container maxWidth="xl">
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
                                        Panel główny
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    {location?.address || 'Brak adresu'}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                                    Ostatnia
                                    aktywność: {location?.lastUpdated ? format(new Date(location?.lastUpdated), "PPpp", {locale: pl}) : format(new Date(), "PPpp", {locale: pl})}
                                </Typography>
                            </Box>

                            {measurements.length !== 0 && (<EnergyCharts measurements={measurements}/>)}

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

                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box sx={{flexGrow: 1, p: 3}}>

                <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mapa lokalizacji budynków
      </Typography>

      <Paper elevation={3} sx={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '4px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {validLocations.map((location, index) => (
            <Marker
              key={`marker-${index}`}
              position={[parseFloat(location.lat), parseFloat(location.lng)]}
            >
              <Popup>
                <div>
                  <strong>{location.name}</strong>
                  <p>Współrzędne: {location.lat}, {location.lng}</p>
                  {location.description && <p>{location.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>
    </Box>

                {/* Główne statystyki */}
                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <StatCard
                            icon={<ThermostatIcon/>}
                            title="Temperatura"
                            value="22.5°C"
                            subtitle="Średnia w budynku"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <StatCard
                            icon={<EnergyIcon/>}
                            title="Energia"
                            value="245 kW"
                            subtitle="Zużycie dzienne"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <StatCard
                            icon={<DevicesIcon/>}
                            title="Urządzenia"
                            value="87/92"
                            subtitle="Aktywne/Total"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <StatCard
                            icon={<SecurityIcon/>}
                            title="Bezpieczeństwo"
                            value="100%"
                            subtitle="Systemy aktywne"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                                      <Autocomplete
                disablePortal
                id="room-select"
                options={locations}
                value={selectedLocation}
                getOptionLabel={(option) => option ? `${option.name}` : ""}
                sx={{ width: '100%', mt: 2 }}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderInput={(params) => <TextField {...params} label="Pokój" />}
                onChange={(event, newValue) => {
                    setSelectedLocation(newValue);
                }}
            />
                    <Grid size={{xs: 12, sm: 6}}>
                        <Item>
                            <Typography variant="h6" gutterBottom>
                                Ostatnie alerty
                            </Typography>
                            <Box sx={{textAlign: 'left'}}>
                                <Box sx={{p: 1, borderBottom: '1px solid #eee'}}>
                                    <Typography>⚠️ Wysoka temperatura w serwerowni</Typography>
                                    <Typography variant="caption">10 min temu</Typography>
                                </Box>
                                <Box sx={{p: 1, borderBottom: '1px solid #eee'}}>
                                    <Typography>🔋 Niskie zużycie energii w strefie A</Typography>
                                    <Typography variant="caption">45 min temu</Typography>
                                </Box>
                                <Box sx={{p: 1}}>
                                    <Typography>🌡️ Awaria czujnika temperatury #12</Typography>
                                    <Typography variant="caption">2 godz. temu</Typography>
                                </Box>
                            </Box>
                        </Item>
                    </Grid>

                    {/* Status oświetlenia */}
                    <Grid size={{xs: 12, sm: 6}}>
                        <Item>
                            <Typography variant="h6" gutterBottom>
                                Status oświetlenia
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 6}}>
                                    <LightbulbIcon color="primary"/>
                                    <Typography>Parter: 65%</Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <LightbulbIcon color="primary"/>
                                    <Typography>I piętro: 42%</Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <LightbulbIcon color="primary"/>
                                    <Typography>II piętro: 38%</Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <LightbulbIcon color="primary"/>
                                    <Typography>Piwnica: 90%</Typography>
                                </Grid>
                            </Grid>
                            <Typography variant="body2" sx={{mt: 2}}>
                                Średnie wykorzystanie: 58%
                            </Typography>
                        </Item>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Main;