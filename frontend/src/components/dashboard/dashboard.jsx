import React, {useEffect, useRef, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    Select,
    MenuItem,
    Divider,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    useMediaQuery,
    Paper,
    useTheme,
    Autocomplete, TextField, Button, LinearProgress, Stack, CardHeader
} from "@mui/material";
import {
    Thermostat,
    Opacity,
    Lightbulb,
    Air,
    ShowChart,
    MapsHomeWork,
    Star,
    Warning,
    Refresh,
    FilterAltOff,
    FilterAlt,
    LocationOn,
    Layers,
    Close,
    Search,
    Sensors,
    Devices, MeetingRoom, Room, Memory
} from "@mui/icons-material";
import {Chart, registerables} from "chart.js";
import {styled} from "@mui/material/styles";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import MainTab from "./tabs/mainTab.jsx";
import LocationTab from "./tabs/locationTab.jsx";
import RoomTab from "./tabs/roomTab.jsx";
import DeviceTab from "./tabs/deviceTab.jsx";

Chart.register(...registerables);

const StyledCard = styled(Card)(({theme}) => ({
    borderRadius: 12,
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6]
    }
}));

const ChartContainer = styled(Box)({
    position: 'relative',
    height: '300px',
    width: '100%'
});

const ChartComponent = ({type, data, options}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext("2d");
            chartInstance.current = new Chart(ctx, {
                type,
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    ...options
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, data, options]);

    return <canvas ref={chartRef}/>;
};

const Dashboard = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('24h');
    const [search, setSearch] = useState("");

    // Mock data generator
    const generateTimeData = (count, min, max) => {
        const data = [];
        let lastValue = (min + max) / 2; // Start with midpoint

        for (let i = 0; i < count; i++) {
            // Create more natural-looking data with some randomness
            const randomChange = (Math.random() - 0.5) * (max - min) * 0.2;
            lastValue = Math.min(max, Math.max(min, lastValue + randomChange));
            data.push(parseFloat(lastValue.toFixed(1)));
        }

        return data;
    };

    const token = localStorage.getItem("access");
    const [num, setNum] = useState(0);
    const theme = useTheme()
    const [temperatureData, setTemperatureData] = useState([]);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState(0);
    const [selectedFloor, setSelectedFloor] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedDevice, setSelectedDevice] = useState("");
    const [selectedSensor, setSelectedSensor] = useState("");
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [devices, setDevices] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [filteredFloors, setFilteredFloors] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState([]);
    const [sensorsData, setSensorsData] = useState([]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(`${API_BASE_URL}charts/`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setSensors(response.data.sensorsData)
            setFilteredSensors(response.data.sensorsData)

            setDevices(response.data.devicesData);
            setFilteredDevices(response.data.devicesData)

            setRooms(response.data.roomsData)
            setFilteredRooms(response.data.roomsData)

            setFilteredFloors(response.data.floorsData)
            setFloors(response.data.floorsData)

            setLocations(response.data.locationsData)
            setMeasurements(response.data.measurementsData)

        } catch (error) {
            console.error("Błąd podczas pobierania urządzeń", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (token) fetchData();
    }, [token]);


    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chart_updates/12/3/`);

        ws.onopen = () => {
            console.log("✅ WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === "sensor_update") {
                    const sensorData = message.data;
                    const tempSensor = sensorData.filter((d) => d.sensor === 6);
                    setTemperatureData({
                        labels: tempSensor.map((td) => new Date(td.created_at).toLocaleDateString()),
                        datasets: [{
                            label: 'Temperature (°C)',
                            data: tempSensor.map((td) => parseFloat(td.value)),
                            borderColor: '#FF6384',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.4,
                            fill: true
                        }]
                    })
                }
            } catch (error) {
                console.error("❌ Błąd przy przetwarzaniu wiadomości WebSocket:", error);
            }
        };

        ws.onclose = () => {
            console.log("❌ WebSocket disconnected");
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, []);

    const getChartType = (dataType) => {
        switch (dataType) {
            case 'TEMPERATURE':
            case 'HUMIDITY':
            case 'LIGHT':
            case 'ENERGY':
            case 'CONTINUOUS':
                return 'line';
            case 'DISCRETE':
            case 'OTHER':
                return 'bar';
            default:
                return 'line';
        }
    };

    const getChartColor = (dataType) => {
        switch (dataType) {
            case 'TEMPERATURE':
                return '#ff6384';
            case 'HUMIDITY':
                return '#36a2eb';
            case 'LIGHT':
                return '#ffcd56';
            case 'ENERGY':
                return '#4bc0c0';
            case 'DISCRETE':
                return '#9966ff';
            default:
                return '#c9cbcf';
        }
    };

    const timeRanges = ['12h', '24h', '7d', '30d'];

    function handleSearch() {

    }

    async function handleTabChange(newValue) {
        setActiveTab(newValue)
        if (newValue === 3) {
            try {
                setLoading(true)
                const response = await client.post(`${API_BASE_URL}device/${selectedDevice.device_id}/`, {
                    type: "device"
                }, {
                    headers: {Authorization: `Bearer ${token}`}
                });

                setMeasurements(response.data)
                console.log(response.data)
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            } finally {
                setLoading(false);
            }
        }

    }

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" component="h1" sx={{fontWeight: 700, mb: 1}}>
                    Wykresy i analityka
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Wszystkie istotne dane z Twoich czujników w jednym miejscu.
                </Typography>

                <IconButton
                    sx={{
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1.2,
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'primary.light'
                        }
                    }}
                >
                    <Tooltip title={"Odśwież"}>
                        <Refresh color="action" fontSize="small"/>
                    </Tooltip>

                </IconButton>
            </Box>

            <Grid item xs={12}>
                <Paper elevation={0}
                       sx={{
                           p: {xs: 1, sm: 2},
                           border: "1px solid #00000020",
                           boxShadow: '0px 2px 12px rgba(0,0,0,0.05)'
                       }}>

                    <Box sx={{
                        pt: 1,
                        borderRadius: '12px',
                    }}>
                        <Grid container spacing={2}>
                            {/* Lokalizacja */}
                            <Grid size={{xs: 12, sm: 6, md: 4}}>
                                <Autocomplete
                                    options={[{id: 'all', name: 'Wszystkie lokalizacje'}, ...locations]}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedLocation || {id: 'all', name: 'Wszystkie lokalizacje'}}
                                    onChange={(e, newValue) => {
                                        const isAllSelected = !newValue || newValue?.id === 'all';
                                        setSelectedLocation(isAllSelected ? null : newValue);
                                        setFilteredFloors(isAllSelected ? [] : floors.filter(f => f.home?.home_id === newValue?.home_id));
                                        setFilteredRooms(isAllSelected ? [] : rooms.filter(r => r.home?.home_id === newValue?.home_id));
                                        setFilteredDevices(isAllSelected ? [] : devices.filter(d => d.location.home_id === newValue?.home_id));
                                        setFilteredSensors(isAllSelected ? [] : sensors.filter(s => s.device.location.home_id === newValue?.home_id));
                                        setSelectedFloor(null);
                                        setSelectedRoom(null);
                                        setSelectedDevice(null);
                                    }}
                                    filterOptions={(options, state) => {
                                        if (!state.inputValue) return options;
                                        return options.filter(option =>
                                            option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Lokalizacja"
                                            variant="outlined"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <LocationOn color="action" sx={{mr: 1}}/>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                />
                            </Grid>

                            {/* Piętro */}
                            <Grid size={{xs: 12, sm: 6, md: 4}}>
                                <Autocomplete
                                    options={[{
                                        id: 'all',
                                        floor_id: 'all',
                                        floor_number: 'Wszystkie piętra'
                                    }, ...filteredFloors]}
                                    getOptionLabel={(option) =>
                                        option?.floor_number ?
                                            (option.id === 'all' ? option.floor_number : `Piętro ${option.floor_number}`) :
                                            "Wybierz piętro"
                                    }
                                    value={selectedFloor || {id: 'all', floor_number: 'Wszystkie piętra'}}
                                    onChange={(e, newValue) => {
                                        const isAllSelected = !newValue || newValue?.id === 'all';
                                        setSelectedFloor(isAllSelected ? null : newValue);
                                        setFilteredRooms(isAllSelected ?
                                            rooms.filter(r => r.home?.home_id === selectedLocation?.home_id) :
                                            rooms.filter(r => r.floor?.floor_id === newValue?.floor_id)
                                        );
                                        setFilteredDevices(isAllSelected ?
                                            devices.filter(r => r.home?.home_id === selectedLocation?.home_id) :
                                            devices.filter(r => r.floor?.floor_id === newValue?.floor_id)
                                        );

                                        setSelectedRoom(null);
                                    }}
                                    disabled={!selectedLocation}
                                    filterOptions={(options, state) => {
                                        if (!state.inputValue) return options;
                                        return options.filter(option =>
                                            option.floor_number.toString().includes(state.inputValue) ||
                                            (option.id === 'all' && 'Wszystkie piętra'.includes(state.inputValue))
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Piętro"
                                            variant="outlined"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <Layers color="action" sx={{mr: 1}}/>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option?.floor_id === value?.floor_id}
                                />
                            </Grid>

                            {/* Pokój */}
                            <Grid size={{xs: 12, sm: 6, md: 4}}>
                                <Autocomplete
                                    options={[{id: 'all', name: 'Wszystkie pokoje'}, ...filteredRooms]}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedRoom || {id: 'all', name: 'Wszystkie pokoje'}}
                                    onChange={(e, newValue) => {
                                        setSelectedRoom(!newValue || newValue?.id === 'all' ? null : newValue);
                                    }}
                                    disabled={!selectedFloor}
                                    filterOptions={(options, state) => {
                                        if (!state.inputValue) return options;
                                        return options.filter(option =>
                                            option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Pokój"
                                            variant="outlined"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <MeetingRoom color="action" sx={{mr: 1}}/>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                />
                            </Grid>

                            {/* Urządzenie */}
                            <Grid size={{xs: 12, sm: 6, md: 4}}>
                                <Autocomplete
                                    options={[{id: 'all', name: 'Wszystkie urządzenia'}, ...filteredDevices.filter(d =>
                                        !selectedRoom || selectedRoom?.id === 'all' || d.room?.room_id === selectedRoom?.room_id
                                    )]}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedDevice || {id: 'all', name: 'Wszystkie urządzenia'}}
                                    onChange={(e, newValue) => {
                                        setSelectedDevice(!newValue || newValue?.id === 'all' ? null : newValue);
                                    }}
                                    disabled={!selectedLocation}
                                    filterOptions={(options, state) => {
                                        if (!state.inputValue) return options;
                                        return options.filter(option =>
                                            option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Urządzenie"
                                            variant="outlined"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <Devices color="action" sx={{mr: 1}}/>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                />
                            </Grid>
                        </Grid>

                        <Box
                            display="flex"
                            flexDirection={{xs: 'column', md: 'row'}}
                            justifyContent="space-between"
                            alignItems={{xs: 'stretch', sm: 'center'}}
                            gap={2}
                            mb={1}
                        >
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => handleTabChange(newValue)}
                                sx={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    '& .MuiTab-root': {
                                        minHeight: 48,
                                        minWidth: 'unset',
                                        px: 1.5,
                                        fontSize: {xs: '0.7rem', sm: '0.8125rem'}
                                    },
                                    mt: 2
                                }}
                            >

                                <Tab label="Ogólne" value={0} icon={<MapsHomeWork fontSize="small"/>}
                                     iconPosition="start"/>

                                {selectedLocation && (
                                    <Tab label="Lokalizacja" value={1} icon={<MapsHomeWork fontSize="small"/>}
                                         iconPosition="start"/>
                                )}


                                {selectedRoom && (
                                    <Tab label="Pokój" value={2} icon={<Room fontSize="small"/>} iconPosition="start"/>
                                )}

                                {selectedDevice && (
                                    <Tab label="Urządzenie" value={3} icon={<Memory fontSize="small"/>}
                                         iconPosition="start"/>
                                )}

                            </Tabs>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {isLoading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
                    <CircularProgress size={80}/>
                </Box>
            ) : (
                <Grid container>
                    {activeTab === 0 && (
                        <MainTab measurements={measurements}/>
                    )}


                    {activeTab === 1 && (
                        <LocationTab/>
                    )}

                    {activeTab === 2 && (
                        <RoomTab/>
                    )}


                    {activeTab === 3 && (
                        <DeviceTab/>
                    )}

                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;