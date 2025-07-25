import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import React, {useState, useEffect} from 'react';
import {useParams, Link} from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Paper,
    IconButton,
    Tooltip,
    Skeleton,
    CircularProgress,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    Button,
    Dialog,
    Checkbox,
    Autocomplete,
    Breadcrumbs, Container
} from '@mui/material';
import {
    RefreshOutlined,
    ShowChart as ShowChartIcon,
    TableChart as TableChartIcon,
    Sensors,
    EditOutlined,
    Delete,
    ListAlt,
    Home,
    Room,
    DeviceHub, MeetingRoom, HomeWork
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {format, formatDistance} from 'date-fns';
import {pl} from 'date-fns/locale';
import SensorChart from "./sensorChart.jsx";
import RulesTab from "../tabs/rulesTab.jsx";
import AlarmsTab from "../tabs/alarmsTab.jsx";

const StyledCard = styled(Card)(({theme}) => ({
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
    display: 'flex',
    border: "1px solid #00000020",
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)'
    }
}));

const SensorPage = () => {
    const [sensor, setSensor] = useState(null);
    const [measurements, setMeasurements] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const [rules, setRules] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chart');
    const [timeRange, setTimeRange] = useState('24h');
    const params = useParams();
    const token = localStorage.getItem("access");
    const [filteredMeasurements, setFilteredMeasurements] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(`${API_BASE_URL}sensor/${params.id}/`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setSensor(response.data.sensorData);
            setMeasurements(response.data.measurementData);
            setAlarms(response.data.actionsData);
            setRules(response.data.rulesData);
            setRooms(response.data.roomsData);
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [params.id, token]);

    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await client.put(`${API_BASE_URL}sensor/${sensor.sensor_id}/`, formData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setSensor(response.data);
            fetchData(); // Refresh data after update
        } catch (error) {
            console.error("Błąd podczas aktualizacji danych:", error);
        } finally {
            setOpen(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleTimeRangeChange = (event, newValue) => {
        setTimeRange(newValue);
        filterMeasurements(newValue);
    };

    const filterMeasurements = (range) => {
        if (!measurements || measurements.length === 0) {
            setFilteredMeasurements([]);
            return;
        }

        const now = new Date();
        let filtered;

        switch (range) {
            case '24h':
                filtered = measurements.filter(m => {
                    const createdAt = new Date(m.created_at);
                    return createdAt > new Date(now.getTime() - 24 * 60 * 60 * 1000);
                });
                break;
            case '7d':
                filtered = measurements.filter(m => {
                    const createdAt = new Date(m.created_at);
                    return createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                });
                break;
            case '30d':
                filtered = measurements.filter(m => {
                    const createdAt = new Date(m.created_at);
                    return createdAt > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                });
                break;
            case 'all':
            default:
                filtered = [...measurements];
                break;
        }

        setFilteredMeasurements(filtered);
    };

    useEffect(() => {
        filterMeasurements(timeRange);
    }, [measurements, timeRange]);

    const dataTypes = [
        {value: 'LIGHT', label: 'Światło'},
        {value: 'HUMIDITY', label: 'Wilgotność'},
        {value: 'ENERGY', label: 'Zużycie energii'},
        {value: 'TEMPERATURE', label: 'Temperatura'},
        {value: 'CONTINUOUS', label: 'Ciągłe'},
        {value: 'DISCRETE', label: 'Dyskretne'},
        {value: 'OTHER', label: 'Inne'}
    ];

    const getDataTypeLabel = (type) => {
        const labels = {
            'LIGHT': 'Światło',
            'HUMIDITY': 'Wilgotność',
            'TEMPERATURE': 'Temperatura',
            'ENERGY': 'Energia',
            'CONTINUOUS': 'Ciągły',
            'DISCRETE': 'Dyskretny',
            'OTHER': 'Inny'
        };
        return labels[type] || type;
    };

    if (!sensor && loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container>
            <Breadcrumbs aria-label="breadcrumb" sx={{mb: 3, mt:3}}>
                <Link to="/" style={{display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none'}}>
                    <Home sx={{mr: 0.5}} fontSize="inherit" />
                    Strona główna
                </Link>
                <Link to="/devices" style={{display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none'}}>
                    <HomeWork sx={{mr: 0.5}} fontSize="inherit" />
                    {sensor?.device?.location?.name}
                </Link>
                <Link to="/devices" style={{display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none'}}>
                    <DeviceHub sx={{mr: 0.5}} fontSize="inherit" />
                    {sensor?.device?.name}
                </Link>
                <Typography color="text.primary" sx={{display: 'flex', alignItems: 'center'}}>
                    <Sensors sx={{mr: 0.5}} fontSize="inherit" />
                    {sensor?.visibleName || sensor?.name}
                </Typography>
            </Breadcrumbs>

            <Grid container spacing={3} sx={{mb: 4, width: "100%"}} >
                {/* Sensor Info Card */}
                <Grid size={{xs: 9}}>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Avatar sx={{
                                        bgcolor: sensor?.device.color,
                                        mr: 2,
                                        width: 56,
                                        height: 56,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        <Sensors />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" component="h1" sx={{fontWeight: 600}}>
                                            {sensor?.visibleName || sensor?.name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            {getDataTypeLabel(sensor?.data_type)} • {sensor?.device?.name}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{display: 'flex', gap: 1}}>
                                    <Tooltip title="Odśwież">
                                        <IconButton
                                            onClick={fetchData}
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                }
                                            }}
                                        >
                                            <RefreshOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edytuj">
                                        <IconButton
                                            onClick={() => {
                                                setFormData({
                                                    ...sensor,
                                                    room: sensor.room ? sensor.room.room_id : sensor.room
                                                });
                                                setOpen(true);
                                            }}
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                }
                                            }}
                                        >
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Usuń">
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'error.main',
                                                    backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                                }
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Divider sx={{my: 2}} />

                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, md: 6}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                        <Room sx={{fontSize: 16, verticalAlign: 'middle', mr: 0.5}} />
                                        Pokój
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                        {sensor?.room?.name || 'Nie przypisano'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                        <DeviceHub sx={{fontSize: 16, verticalAlign: 'middle', mr: 0.5}} />
                                        Nr seryjny
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                        {sensor?.serial_number || 'Nieznany'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                        <ShowChartIcon sx={{fontSize: 16, verticalAlign: 'middle', mr: 0.5}} />
                                        Typ danych
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                        {getDataTypeLabel(sensor?.data_type)}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                        <ListAlt sx={{fontSize: 16, verticalAlign: 'middle', mr: 0.5}} />
                                        Jednostka
                                    </Typography>
                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                        {sensor?.unit || '---'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </Grid>

                {/* Last Measurement Card */}
                <Grid size={{xs: 3}}>
                    <StyledCard>
                        <CardContent sx={{height: '100%', display: 'flex', flexDirection: 'column', textAlign: "center", alignItems: "center", }}>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                Ostatni odczyt
                            </Typography>
                            {measurements.length > 0 ? (
                                <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                    <Box sx={{display: 'flex', alignItems: 'baseline', mb: 2}}>
                                        <Typography variant="h2" sx={{mr: 1, fontWeight: 700}}>
                                            {Math.round(measurements[0].value * 100) / 100}
                                        </Typography>
                                        <Typography variant="h5" color="text.secondary">
                                            {sensor?.unit}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(measurements[0].created_at), 'PPpp', {locale: pl})}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            ({formatDistance(new Date(measurements[0].created_at), new Date(), {
                                                addSuffix: true,
                                                locale: pl
                                            })})
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <Typography variant="body1" color="text.secondary">
                                        Brak danych pomiarowych
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* Tabs Section */}
            <Paper sx={{mb: 3, borderRadius: 2, border: "1px solid #00000020", boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Wykres" value="chart" icon={<ShowChartIcon />} />
                    <Tab label="Tabela" value="table" icon={<TableChartIcon />} />
                    <Tab label="Zasady" value="rules" icon={<ListAlt />} />
                </Tabs>
            </Paper>

            {/* Chart Tab */}
            {activeTab === 'chart' && (
                <StyledCard sx={{mb: 3}}>
                    <CardContent>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                Historia pomiarów
                            </Typography>
                            <Tabs
                                value={timeRange}
                                onChange={handleTimeRangeChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                size="small"
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        borderRadius: 3
                                    }
                                }}
                            >
                                <Tab label="24h" value="24h" />
                                <Tab label="7 dni" value="7d" />
                                <Tab label="30 dni" value="30d" />
                                <Tab label="Wszystkie" value="all" />
                            </Tabs>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            height: 400,
                            width: "100%",
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {measurements.length > 0 ? (
                                <SensorChart measurements={filteredMeasurements} />
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Brak danych do wyświetlenia
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </StyledCard>
            )}

            {/* Table Tab */}
            {activeTab === 'table' && (
                <AlarmsTab alarms={alarms} loading={loading} type={"sensor"} />
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
                <RulesTab rules={rules} setRules={setRules} sensors={[sensor]} devices={sensor.device} type={"sensor"} />
            )}

            {/* Edit Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2}}>
                    Edytuj czujnik
                </DialogTitle>
                <DialogContent sx={{pt: 3}}>
                    <Box component="form" sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Nazwa czujnika"
                            name="visibleName"
                            value={formData.visibleName || ''}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{mb: 2}}
                        />

                        <Autocomplete
                            disablePortal
                            id="room-select"
                            options={rooms}
                            getOptionLabel={(option) => option ? `${option.name} (Piętro ${option?.floor?.floor_number})` : ""}
                            value={rooms.find(room => room.room_id === formData.room) || null}
                            sx={{mb: 2}}
                            isOptionEqualToValue={(option, value) => option?.room_id === value?.room_id}
                            renderInput={(params) => <TextField {...params} label="Pokój" />}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    room: newValue?.room_id || null
                                }));
                            }}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Numer seryjny"
                            name="serial_number"
                            value={formData.serial_number || ''}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{mb: 2}}
                        />

                        <FormControl fullWidth margin="normal" sx={{mb: 2}}>
                            <InputLabel id="data-type-label">Typ danych</InputLabel>
                            <Select
                                labelId="data-type-label"
                                name="data_type"
                                value={formData.data_type || ''}
                                onChange={handleChange}
                                label="Typ danych"
                                variant="outlined"
                            >
                                {dataTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Jednostka"
                            name="unit"
                            value={formData.unit || ''}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 3, borderTop: '1px solid rgba(0,0,0,0.08)'}}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{minWidth: 100}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{minWidth: 100}}
                    >
                        Zapisz zmiany
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SensorPage;