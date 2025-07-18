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
    DialogTitle, DialogContent, DialogActions
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
    ExpandLess, ExpandMore, Room, Warning, Thermostat, EnergySavingsLeaf, ListAlt, Palette, StarBorder
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {format, formatDistance} from 'date-fns';
import {pl} from 'date-fns/locale';
import {API_BASE_URL} from "../../../config";
import client from "../../../client";
import {lightGreen} from "@mui/material/colors";
import {ChromePicker} from "react-color";

const StyledCard = styled(Card)(({theme}) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
    },
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16
}));

const DeviceInfoRow = ({label, value, icon}) => (
    <Box sx={{display: 'flex', mb: 2}}>
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
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
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
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

    const [formDataDevice, setFormDataDevice] = useState({
    name: '',
    serial_number: '',
    topic: '',
    info: '',
    brand: '',
    isActive: true,
    color: '#42adf5',
    isFavorite: false,
    location: '',
    floor: '',
    room: '',
    data_type: 'CONTINUOUS'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);


        useEffect(() => {
        if (device) {
          setFormDataDevice({
            name: device.name || '',
            serial_number: device.serial_number || '',
            topic: device.topic || '',
            info: device.info || '',
            brand: device.brand || '',
            isActive: device.isActive,
            color: device.color || '#42adf5',
            isFavorite: device.isFavorite,
            location: device.location?.home_id || '',
            floor: device.floor?.floor_id || '',
            room: device.room?.room_id || '',
            data_type: device.data_type || 'CONTINUOUS'
          });
        }
      }, [device]);

      const handleChangeDevice = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleToggleFavoriteDevice = () => {
        setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
      };

      const handleColorChange = (color) => {
        setFormData(prev => ({ ...prev, color: color.hex }));
      };

      const handleSubmitDevice = () => {
        // onSave(formData);
      };

      // const filteredFloors = floors.filter(floor =>
      //   floor.home_id === formData.location
      // );
      //
      // const filteredRooms = rooms.filter(room =>
      //   room.floor_id === formData.floor
      // );



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
        }
        onClose()
    };

    const onClose = () => {
        setOpen(!open)
    };

    const handleToggleFavorite = () => {
        setDevice(prev => ({...prev, isFavorite: !prev.isFavorite}));
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


    const filteredSensors = activeTab === 'all'
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

    const handleActiveChange = async (e) => {
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

    function handleEdit() {

    }

    const toggleDetails = () => setShowDetails(!showDetails);

    return (
        <Container maxWidth="xl">
            <Box sx={{p: 3}}>
                <Box sx={{
                    p: 3,
                    mb: 4,
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
                                            onClick={()=> {
                                                setOpenDeviceModal(!openDeviceModal)
                                                setFormDataDevice(device)
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
                                Ostatnia aktywność: {format(new Date(device?.lastUpdated), "PPpp", {locale: pl})}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
                                    <Chip
                                        icon={<MeetingRoom fontSize="small"/>}
                                        label={`Piętro ${device?.floor?.floor_number || 'N/A'}`}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                    <Chip
                                        icon={<Room fontSize="small"/>}
                                        onClick={() => navigate(`/room/${device?.room.room_id}`)}
                                        label={device?.room?.name || 'N/A'}
                                        variant="outlined"
                                        size="small"
                                        sx={{borderRadius: 1}}
                                    />
                                    <Chip
                                        icon={<Business fontSize="small"/>}
                                        onClick={() => navigate(`/home/${device?.location.home_id}`)}
                                        label={device?.location?.name || 'N/A'}
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

                {/* Sekcja szczegółów - widoczna tylko po kliknięciu */}
                {showDetails && (
                    <Box sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
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
                            <Grid item xs={6} md={6}>
                                <DeviceInfoRow
                                    label="Typ urządzenia"
                                    value={device?.type || 'Nieokreślony'}
                                    icon={<DeviceHub fontSize="small"/>}
                                />
                                <DeviceInfoRow
                                    label="Liczba czujników"
                                    value={device?.sensorNumber || 'Nie dotyczy'}
                                    icon={<Sensors fontSize="small"/>}
                                />
                            </Grid>
                            <Grid item xs={6} md={6}>
                                <DeviceInfoRow
                                    label="Marka"
                                    value={device?.brand || 'Nieznana marka'}
                                    icon={<Update fontSize="small"/>}
                                />
                                <DeviceInfoRow
                                    label="Nr. seryjny"
                                    value={device?.serial_number || 'Brak'}
                                    icon={<Update fontSize="small"/>}
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
                        <Tab label="Wszystkie" value="all"/>
                        <Tab label="Alarmy" value="alarms" icon={<Warning/>} iconPosition="start"/>
                        <Tab label="Zasady" value="Rules" icon={<ListAlt/>} iconPosition="start"/>
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
                        {filteredSensors.length === 0 ? (
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
                                {filteredSensors.map((sensor) => (
                                    <Grid item xs={12} sm={6} md={4} key={sensor.sensor_id}>
                                        <StyledCard>
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

                                                <Divider sx={{my: 2}}/>

                                                <Box sx={{mb: 3}}>
                                                    <Typography variant="h4" component="div" align="center"
                                                                fontWeight="fontWeightMedium">
                                                        {Math.round(sensor.lastValue.value * 100) / 100 || '--'}
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
                    <Button onClick={onClose}>Anuluj</Button>
                    <Button onClick={() => handleSubmit(currentSensor)} variant="contained" color="primary">
                        {'Zapisz'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openDeviceModal} onClose={()=>setOpenDeviceModal(!openDeviceModal)} maxWidth="md" fullWidth>
                <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar sx={{
                        bgcolor: formDataDevice.color,
                        width: 40,
                        height: 40,
                        // color: theme.palette.getContrastText(formData.color)
                    }}>
                        <MemoryIcon/>
                    </Avatar>
                    Edytuj urządzenie
                    <Tooltip title="Ulubione">
                        <IconButton onClick={handleToggleFavorite} sx={{ml: 'auto'}}>
                            {formDataDevice.isFavorite ? (
                                <Star color="warning"/>
                            ) : (
                                <StarBorder/>
                            )}
                        </IconButton>
                    </Tooltip>
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
                                onChange={handleChange}
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="Numer seryjny"
                                name="serial_number"
                                value={formDataDevice.serial_number}
                                onChange={handleChange}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="Marka"
                                name="brand"
                                value={formDataDevice.brand}
                                onChange={handleChange}
                                margin="normal"
                            />

                            <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                                <Box sx={{position: 'relative'}}>
                                    <Tooltip title="Zmień kolor">
                                        <IconButton onClick={() => setShowColorPicker(!showColorPicker)}>
                                            <Palette/>
                                        </IconButton>
                                    </Tooltip>
                                    {showColorPicker && (
                                        <Box sx={{
                                            position: 'absolute',
                                            zIndex: 10,
                                            top: '100%',
                                            left: 0,
                                            mt: 1
                                        }}>
                                            <ChromePicker
                                                color={formDataDevice.color}
                                                onChangeComplete={handleColorChange}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formDataDevice.isActive}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                isActive: e.target.checked
                                            }))}
                                            color="success"
                                        />
                                    }
                                    label={formDataDevice.isActive ? 'Aktywne' : 'Nieaktywne'}
                                />
                            </Box>
                        </Box>

                        {/* Prawa kolumna - lokalizacja i typ */}
                        <Box>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Lokalizacja</InputLabel>
                                <Select
                                    name="location"
                                    value={formDataDevice.location}
                                    onChange={handleChange}
                                    label="Lokalizacja"
                                    required
                                >
                                    {/*{locations.map(location => (*/}
                                    {/*    <MenuItem key={location.home_id} value={location.home_id}>*/}
                                    {/*        {location.name}*/}
                                    {/*    </MenuItem>*/}
                                    {/*))}*/}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Piętro</InputLabel>
                                <Select
                                    name="floor"
                                    value={formDataDevice.floor}
                                    onChange={handleChange}
                                    label="Piętro"
                                    disabled={!formDataDevice.location}
                                >
                                    {/*<MenuItem value="">Brak</MenuItem>*/}
                                    {/*{filteredFloors.map(floor => (*/}
                                    {/*    <MenuItem key={floor.floor_id} value={floor.floor_id}>*/}
                                    {/*        {floor.floor_number} - {floor.name}*/}
                                    {/*    </MenuItem>*/}
                                    {/*))}*/}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Pokój</InputLabel>
                                <Select
                                    name="room"
                                    value={formDataDevice.room}
                                    onChange={handleChange}
                                    label="Pokój"
                                    disabled={!formDataDevice.floor}
                                >
                                    <MenuItem value="">Brak</MenuItem>
                                    {/*{filteredRooms.map(room => (*/}
                                    {/*    <MenuItem key={room.room_id} value={room.room_id}>*/}
                                    {/*        {room.name}*/}
                                    {/*    </MenuItem>*/}
                                    {/*))}*/}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Typ danych</InputLabel>
                                <Select
                                    name="data_type"
                                    value={formDataDevice.data_type}
                                    onChange={handleChange}
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
                        onChange={handleChange}
                        margin="normal"
                        sx={{mt: 3}}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={()=>setOpenDeviceModal(!openDeviceModal)} color="inherit">
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