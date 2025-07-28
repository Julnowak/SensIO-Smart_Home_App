import React, {useState, useEffect} from 'react';
import {useParams, Link, useNavigate} from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Divider,
    Chip,
    Tabs,
    Tab,
    Paper,
    LinearProgress,
    IconButton,
    Tooltip,
    Skeleton,
    CircularProgress,
    Button,
    Avatar,
    useTheme,
    FormControlLabel,
    Switch,
    Container,
    Badge,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Dialog,
    DialogTitle, DialogContent, DialogActions, InputAdornment, Popover
} from '@mui/material';
import {
    LightbulbOutlined,
    OpacityOutlined,
    SettingsInputComponentOutlined,
    ShowChartOutlined,
    BubbleChartOutlined,
    MoreHorizOutlined,
    RefreshOutlined,
    InfoOutlined,
    Memory as MemoryIcon,
    MeetingRoom,
    Business,
    EditOutlined,
    DeviceHub,
    Sensors,
    Update,
    Star,
    ExpandLess,
    ExpandMore,
    Room,
    Warning,
    Thermostat,
    EnergySavingsLeaf,
    ListAlt,
    Palette,
    StarBorder,
    Close,
    Usb,
    QrCode, Layers, BarChartOutlined, Info
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {format, formatDistance} from 'date-fns';
import {pl} from 'date-fns/locale';
import {API_BASE_URL} from "../../../config.jsx";
import client from "../../../client.jsx";
import {lightGreen} from "@mui/material/colors";
import {ChromePicker, SketchPicker} from "react-color";
import AlarmsTab from "../../tabs/alarmsTab.jsx";
import {BarChart, LineChart, PieChart} from "@mui/x-charts";
import RulesTab from "../../tabs/rulesTab.jsx";
import LightUsageChart from "../lightChart.jsx";
import DeviceCharts from "./deviceCharts.jsx";

const StyledCard = styled(Card)(({theme, s}) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
    },
    height: '100%',
    display: 'flex',
    marginTop: 10,
    flexDirection: 'column',
    border: "1px solid #00000020",
    borderRadius: 16,
    backgroundColor: (s.data_type === "LIGHT" && parseInt(s.lastValue.value) === 1 ? "rgba(255,242,0,0.2)" : null)
}));

const DeviceInfoRow = ({label, value, icon}) => (
    <Box sx={{display: 'flex', mb: 2}}>
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            mr: 1,
            color: 'text.secondary'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle2" color="text.secondary">
                {label}
            </Typography>
            <Typography>{value}</Typography>
        </Box>
    </Box>
);

const DevicePage = () => {
    const [sensors, setSensors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rules, setRules] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [device, setDevice] = useState(null);
    const [currentSensor, setCurrentSensor] = useState(null);
    const params = useParams();
    const token = localStorage.getItem("access");
    const theme = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [openDeviceModal, setOpenDeviceModal] = useState(false);

    const [showDetails, setShowDetails] = useState(false);
    const [formData, setFormData] = useState({
        room: '',
        name: '',
        visibleName: '',
        serial_number: '',
        device: '',
        data_type: 'CONTINUOUS',
        unit: '',
        color: ''
    });


    const dataTypes = [
        {value: 'LIGHT', label: 'Światło'},
        {value: 'HUMIDITY', label: 'Wilgotność'},
        {value: 'ENERGY', label: 'Zużycie energii'},
        {value: 'TEMPERATURE', label: 'Temperatura'},
        {value: 'CONTINUOUS', label: 'Ciągłe'},
        {value: 'DISCRETE', label: 'Dyskretne'},
        {value: 'OTHER', label: 'inne/różne'},
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await client.get(`${API_BASE_URL}device/${params.id}/`, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setDevice(response.data.deviceData);
                setSensors(response.data.sensorsData);
                setLocations(response.data.locationsData)
                setRooms(response.data.roomsData)
                setFloors(response.data.floorsData)
                setAlarms(response.data.actionsData)
                setRules(response.data.rulesData)
                setMeasurements(response.data.measurementsData)

            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [params.id, token]);

    const [formDataDevice, setFormDataDevice] = useState({});

    const handleChangeComplete = (newColor) => {
        setFormDataDevice(prev => ({...prev, color: newColor.hex}));
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSubmitDevice = async () => {
        try {
            setLoading(true)
            const response = await client.put(`${API_BASE_URL}device/${device.device_id}/`, formDataDevice, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setDevice(response.data)
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        } finally {
            setLoading(false);
            setOpenDeviceModal(!openDeviceModal)

        }
    };

    const filteredFloors = floors.filter(floor =>
        floor.home.home_id === formDataDevice.location
    );

    const filteredRooms = rooms.filter(room =>
        (room.home?.home_id === formDataDevice.location) &&
        (room.floor.floor_id === formDataDevice.floor)
    );

    const handleChangeDevice = (e) => {
        const {name, value} = e.target;
        setFormDataDevice(prev => ({
            ...prev,
            [name]: value,
        }));

    };
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

    };

    const handleSubmit = async (sensorId) => {
        try {
            const response = await client.put(`${API_BASE_URL}sensor/${sensorId}/`, formData, {
                headers: {Authorization: `Bearer ${token}`}
            });

            let s = response.data
            setSensors(prevSensors =>
                prevSensors.map(sen =>
                    sen.sensor_id === s.sensor_id ? s : sen
                )
            );
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        } finally {
            setOpen(!open)
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const response = await client.put(`${API_BASE_URL}device/${params.id}/`, {
                isFavorite: !device.isFavorite,
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setDevice(response.data);
        } catch (error) {
            console.error("Błąd podczas odświeżania danych:", error);
        }
    };


    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await client.get(`${API_BASE_URL}device/${params.id}/`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setDevice(response.data.deviceData);
            setSensors(response.data.sensorsData);
        } catch (error) {
            console.error("Błąd podczas odświeżania danych:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };


    const filteredSensors = activeTab === 0
        ? sensors
        : sensors.filter(sensor => sensor.data_type === activeTab);

    const getDataTypeIcon = (type) => {
        switch (type) {
            case 'LIGHT':
                return <LightbulbOutlined color="warning"/>;
            case 'HUMIDITY':
                return <OpacityOutlined color="info"/>;
            case 'TEMPERATURE':
                return <Thermostat color="error"/>;
            case 'CONTINUOUS':
                return <ShowChartOutlined color="success"/>;
            case 'DISCRETE':
                return <BubbleChartOutlined color="secondary"/>;
            case 'ENERGY':
                return <EnergySavingsLeaf color="success"/>;
            default:
                return <MoreHorizOutlined color="disabled"/>;
        }
    };

    const getDataTypeLabel = (type) => {
        const labels = {
            'LIGHT': 'Światło',
            'TEMPERATURE': 'Temperatura',
            'HUMIDITY': 'Wilgotność',
            'Energy': 'Energia',
            'CONTINUOUS': 'Ciągły',
            'DISCRETE': 'Dyskretny',
            'OTHER': 'Inny'
        };
        return labels[type] || type;
    };

    const handleActiveChange = async () => {
        const response = await client.post(API_BASE_URL + `device/${params.id}/`,
            {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setDevice(response.data)
    };

    if (!device && loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60}/>
            </Box>
        );
    }

    const toggleDetails = () => setShowDetails(!showDetails);

    const handleLightChange = async (sensID, mes) => {
        try {
            await client.put(`${API_BASE_URL}sensor/${sensID}/`,
                {
                    type: "lightChange",
                    measurementID: mes.measurement_id,
                    value: (parseInt(mes.value) === 0 ? 1 : 0)
                }, {
                    headers: {Authorization: `Bearer ${token}`}
                });

            setSensors((prev) =>
                prev.map((s) =>
                    s.sensor_id === sensID
                        ? {
                            ...s,
                            lastValue: {
                                ...s.lastValue,
                                value: (parseInt(mes.value) === 0 ? "1" : "0")
                            }
                        }
                        : s
                )
            );

        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        } finally {
            setLoading(false);
        }
    };


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
                    <Box sx={{display: 'flex', gap: 3, flex: 1}}>
                        <Badge
                            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                            badgeContent={" "}
                            invisible={!device?.isActive}
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
                                bgcolor: device?.color || 'primary.main',
                                color: 'primary.contrastText',
                                fontSize: 32,
                                position: 'relative'
                            }}>
                                <MemoryIcon fontSize="inherit"/>
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
                                        {device?.name || 'Ładowanie...'}
                                    </Typography>
                                    <IconButton
                                        onClick={handleToggleFavorite}
                                        size="small"
                                        sx={{
                                            color: device?.isFavorite ? 'warning.main' : 'text.disabled',
                                            '&:hover': {
                                                color: 'warning.main'
                                            }
                                        }}
                                    >
                                        <Star fontSize="small"/>
                                    </IconButton>
                                </Box>

                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={device?.isActive || false}
                                                onChange={handleActiveChange}
                                                color="success"
                                                size="medium"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" fontWeight={500}>
                                                {device?.isActive ? 'Włączony' : 'Wyłączony'}
                                            </Typography>
                                        }
                                        labelPlacement="start"
                                        sx={{m: 0}}
                                    />
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
                                            onClick={() => {
                                                setOpenDeviceModal(!openDeviceModal);
                                                setFormDataDevice({
                                                    ...device,
                                                    location: device?.location.home_id,
                                                    floor: device.floor ? device.floor.floor_id : device.floor,
                                                    room: device.room ? device.room.room_id : device.room
                                                });
                                            }}
                                            size="small"
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                }
                                            }}
                                        >
                                            <EditOutlined fontSize="small"/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Typography color="text.secondary" sx={{mb: 2}}>
                                Ostatnia
                                aktywność: {device?.lastUpdated ? format(new Date(device?.lastUpdated), "PPpp", {locale: pl}) : format(new Date(), "PPpp", {locale: pl})}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                                    {device?.floor && (
                                        <Chip
                                            icon={<Layers fontSize="small"/>}
                                            label={`Piętro ${device?.floor?.floor_number || 'N/A'}`}
                                            variant="outlined"
                                            size="small"
                                            sx={{borderRadius: 1}}
                                        />
                                    )}

                                    {device?.room && (
                                        <Chip
                                            icon={<MeetingRoom fontSize="small"/>}
                                            onClick={() => navigate(`/room/${device?.room.room_id}`)}
                                            label={device?.room?.name || 'N/A'}
                                            variant="outlined"
                                            size="small"
                                            sx={{borderRadius: 1}}
                                        />
                                    )}

                                    <Chip
                                        icon={<Business fontSize="small"/>}
                                        onClick={() => navigate(`/home/${device?.location.home_id}`)}
                                        label={device?.location?.name || 'N/A'}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                    <Chip
                                        icon={getDataTypeIcon(device?.data_type)}
                                        label={device?.data_type|| 'N/A'}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                </Box>

                                <Button
                                    onClick={toggleDetails}
                                    variant="text"
                                    size="small"
                                    endIcon={showDetails ? <ExpandLess/> : <ExpandMore/>}
                                    sx={{
                                        color: 'text.secondary',
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {showDetails && (
                    <Box sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid #00000020",
                        backgroundColor: 'background.paper',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                        animation: 'fadeIn 0.3s ease',
                        '@keyframes fadeIn': {
                            from: {opacity: 0, transform: 'translateY(-10px)'},
                            to: {opacity: 1, transform: 'translateY(0)'}
                        }
                    }}>
                        <Typography variant="h6" fontWeight={600} sx={{mb: 2}}>
                            Szczegóły urządzenia
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid size={{xs: 3, md: 2}}>
                                <DeviceInfoRow
                                    label="Typ urządzenia"
                                    value={device?.type || 'Nieokreślony'}
                                    icon={<DeviceHub fontSize="small"/>}
                                />
                            </Grid>
                            <Grid size={{xs: 3, md: 2}}>
                                <DeviceInfoRow
                                    label="Liczba czujników"
                                    value={device?.sensorNum || 'Nie dotyczy'}
                                    icon={<Sensors fontSize="small"/>}
                                />
                            </Grid>
                            <Grid size={{xs: 3, md: 2}}>
                                <DeviceInfoRow
                                    label="Marka"
                                    value={device?.brand || 'Nieznana marka'}
                                    icon={<Usb fontSize="small"/>}
                                />
                            </Grid>
                            <Grid size={{xs: 3, md: 2}}>
                                <DeviceInfoRow
                                    label="Nr. seryjny"
                                    value={device?.serial_number || 'Brak'}
                                    icon={<QrCode fontSize="small"/>}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <DeviceInfoRow
                                    label="Dodatkowe informacje"
                                    value={device?.info || 'Brak'}
                                    icon={<Info fontSize="small"/>}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <Paper elevation={0}
                       sx={{
                           width: "100%",
                           border: "1px solid #00000020",
                           borderRadius: 2,
                           overflow: 'hidden',
                           mt: 2
                       }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Czujniki" value={0} icon={<Sensors/>} iconPosition="start"/>
                        <Tab label="Alarmy" value={1} icon={<Warning/>} iconPosition="start"/>
                        <Tab label="Zasady" value={2} icon={<ListAlt/>} iconPosition="start"/>
                        <Tab label="Wykresy" value={3} icon={<BarChartOutlined/>} iconPosition="start"/>
                    </Tabs>
                </Paper>

                {loading ? (
                    <Grid mt={0.5} container spacing={3}>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item}>
                                <Skeleton variant="rectangular" height={200} sx={{borderRadius: 2}}/>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <>
                        {activeTab === 0 && filteredSensors.length === 0 ?
                            (
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
                                        Brak czujników do wyświetlenia
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Wybierz inny filtr lub sprawdź połączenie z systemem
                                    </Typography>
                                </Box>

                            ) : (
                                <Grid container spacing={3} mt={0.5}>
                                    {filteredSensors?.map((sensor) => (
                                        <Grid size={{xs: 12, sm: 6, md: 4}} key={sensor.sensor_id}>
                                            <StyledCard s={sensor}>
                                                <CardContent sx={{flexGrow: 1}}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                        <Box sx={{cursor: "pointer"}}
                                                             onClick={() => navigate(`/sensor/${sensor.sensor_id}`)}>
                                                            <Typography variant="h6" component="h2">
                                                                {sensor.visibleName || sensor.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {sensor.room?.name || 'Brak lokalizacji'}
                                                            </Typography>
                                                        </Box>
                                                        <Tooltip title={getDataTypeLabel(sensor.data_type)}>
                                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                {getDataTypeIcon(sensor.data_type)}
                                                            </Box>
                                                        </Tooltip>
                                                    </Box>

                                                    <Box sx={{mb: 3}}>
                                                        <Typography variant="h4" component="div" align="center"
                                                                    fontWeight="fontWeightMedium">
                                                            {sensor.data_type === "LIGHT" ? (parseInt(sensor.lastValue.value) === 1 ? "ON" : "OFF") : (Math.round(sensor.lastValue.value * 100) / 100 || "---")}
                                                            <Typography variant="body1" component="span"
                                                                        color="text.secondary">
                                                                {sensor.unit ? ` ${sensor.unit}` : ''}
                                                            </Typography>
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Box>
                                                            <Chip
                                                                label={'Edytuj'}
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    setOpen(!open)
                                                                    setCurrentSensor(sensor.sensor_id)
                                                                    setFormData(sensor)
                                                                }}
                                                            />
                                                            {sensor.data_type === "LIGHT" &&
                                                                <Switch
                                                                    onChange={() => handleLightChange(sensor.sensor_id, sensor.lastValue)}
                                                                    color="warning"
                                                                    checked={parseInt(sensor.lastValue.value)}/>}
                                                        </Box>

                                                        <Typography variant="caption" color="text.secondary">
                                                            {sensor.lastValue.saved_at ? formatDistance(new Date(sensor.lastValue.saved_at), new Date(), {
                                                                addSuffix: true,
                                                                locale: pl
                                                            }) : 'Brak danych'}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </StyledCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}

                        {activeTab === 1 && (
                            <AlarmsTab loading={loading} alarms={alarms} setAlarms={setAlarms} type={"device"}/>)}
                        {activeTab === 2 && (<RulesTab rules={rules} setRules={setRules} devices={[device]} sensors={sensors}/>)}
                        {activeTab === 3 && (<DeviceCharts sensors={sensors} measurements={measurements}/>)}

                    </>
                )}
            </Box>

            <Dialog open={open} maxWidth="sm" fullWidth>
                <DialogTitle>{'Edytuj czujnik'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{mt: 1}}>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Nazwa czujnika"
                            name="visibleName"
                            value={formData.visibleName}
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Numer seryjny"
                            name="serial_number"
                            value={formData.serial_number}
                            onChange={handleChange}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="data-type-label">Typ danych</InputLabel>
                            <Select
                                labelId="data-type-label"
                                name="data_type"
                                value={formData.data_type}
                                onChange={handleChange}
                                label="Typ danych"
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
                            value={formData.unit}
                            onChange={handleChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(!open)}>Anuluj</Button>
                    <Button onClick={() => handleSubmit(currentSensor)} variant="contained" color="primary">
                        {'Zapisz'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openDeviceModal} onClose={() => setOpenDeviceModal(!openDeviceModal)} maxWidth="md" fullWidth>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar sx={{
                        bgcolor: formDataDevice.color,
                        width: 40,
                        height: 40,
                    }}>
                        <MemoryIcon/>
                    </Avatar>
                    Edytuj urządzenie
                    <IconButton onClick={() => setOpenDeviceModal(!openDeviceModal)} sx={{ml: 'auto'}}>
                        <Close/>
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'},
                        gap: 3,
                        mt: 2
                    }}>
                        {/* Lewa kolumna - podstawowe informacje */}
                        <Box>
                            <TextField
                                fullWidth
                                label="Nazwa urządzenia"
                                name="name"
                                value={formDataDevice.name}
                                onChange={handleChangeDevice}
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="Numer seryjny"
                                name="serial_number"
                                value={formDataDevice.serial_number}
                                onChange={handleChangeDevice}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="Marka"
                                name="brand"
                                value={formDataDevice.brand}
                                onChange={handleChangeDevice}
                                margin="normal"
                            />

                            <TextField
                                label="Kolor"
                                value={formDataDevice.color}
                                onClick={handleClick}
                                margin="normal"
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClick} size="small">
                                                <div
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        backgroundColor: formDataDevice.color,
                                                        border: '1px solid #ccc',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth
                            />

                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >

                            <SketchPicker
                                color={formData.color}
                                onChangeComplete={handleChangeComplete}
                                presetColors={[
                                    '#FF0000', '#00FF00', '#0000FF',
                                    '#FFFF00', '#FF00FF', '#00FFFF',
                                    '#FFFFFF', '#000000', '#888888'
                                ]}
                            />

                            </Popover>

                        </Box>

                        <Box>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Lokalizacja</InputLabel>
                                <Select
                                    name="location"
                                    value={formDataDevice?.location}
                                    onChange={handleChangeDevice}
                                    label="Lokalizacja"
                                    required
                                >
                                    {locations?.map(location => (
                                        <MenuItem key={location.home_id} value={location.home_id}>
                                            {location.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Piętro</InputLabel>
                                <Select
                                    name="floor"
                                    value={formDataDevice.floor}
                                    onChange={handleChangeDevice}
                                    label="Piętro"
                                    disabled={!formDataDevice.location}
                                >
                                    <MenuItem value="">Brak</MenuItem>
                                    {filteredFloors.map(floor => (
                                        <MenuItem key={floor.floor_id} value={floor.floor_id}>
                                            Piętro {floor.floor_number}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Pokój</InputLabel>
                                <Select
                                    name="room"
                                    value={formDataDevice.room}
                                    onChange={handleChangeDevice}
                                    label="Pokój"
                                    disabled={!formDataDevice.floor}
                                >
                                    <MenuItem value="">Brak</MenuItem>
                                    {filteredRooms.map(room => (
                                        <MenuItem key={room.room_id} value={room.room_id}>
                                            {room.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Typ danych</InputLabel>
                                <Select
                                    name="data_type"
                                    value={formDataDevice.data_type}
                                    onChange={handleChangeDevice}
                                    label="Typ danych"
                                >
                                    {dataTypes.map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Dodatkowe informacje"
                        name="info"
                        value={formDataDevice.info}
                        onChange={handleChangeDevice}
                        margin="normal"
                        sx={{mt: 3}}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDeviceModal(!openDeviceModal)} color="inherit">
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSubmitDevice}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20}/> : null}
                    >
                        Zapisz zmiany
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DevicePage;