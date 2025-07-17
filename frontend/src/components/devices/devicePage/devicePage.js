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
    useTheme, FormControlLabel, Switch, Container
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
    ArrowBack as ArrowBackIcon,
    Memory as MemoryIcon
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {format, formatDistance} from 'date-fns';
import {pl} from 'date-fns/locale';
import {API_BASE_URL} from "../../../config";
import client from "../../../client";

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

const DevicePage = () => {
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [device, setDevice] = useState(null);
    const params = useParams();
    const token = localStorage.getItem("access");
    const theme = useTheme();
    const navigate = useNavigate();

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
            case 'CONTINUOUS':
                return <ShowChartOutlined color="success"/>;
            case 'DISCRETE':
                return <BubbleChartOutlined color="secondary"/>;
            case 'FUNCTIONAL':
                return <SettingsInputComponentOutlined color="action"/>;
            default:
                return <MoreHorizOutlined color="disabled"/>;
        }
    };

    const getDataTypeLabel = (type) => {
        const labels = {
            'LIGHT': 'Światło',
            'HUMIDITY': 'Wilgotność',
            'CONTINUOUS': 'Ciągły',
            'DISCRETE': 'Dyskretny',
            'FUNCTIONAL': 'Funkcyjny',
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

    return (
        <Container maxWidth="xl">
        <Box sx={{p: 3}}>
            <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button
                    component={Link}
                    to="/myDevices"
                    startIcon={<ArrowBackIcon/>}
                    variant="outlined"
                    sx={{borderRadius: 2}}
                >
                    Powrót
                </Button>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    {lastUpdated && (
                        <Typography variant="caption" color="text.secondary" sx={{mr: 2}}>
                            Ostatnia aktualizacja: {format(lastUpdated, 'PPpp', {locale: pl})}
                        </Typography>
                    )}

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={device.isActive}
                                    onChange={handleActiveChange}
                                    color="success"
                                />
                            }
                            label="Aktywne"
                        />
                        <Tooltip title="Odśwież">
                            <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
                                <RefreshOutlined/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', mb: 4, gap: 3}}>
                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        color: "black",
                        bgcolor: device?.color || theme.palette.primary.main,
                    }}
                >
                    <MemoryIcon fontSize="medium"/>
                </Avatar>
                <Box>
                    <Typography variant="h4" component="h1">
                        {device?.name || 'Ładowanie...'}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {device.brand}, SN: {device?.serial_number || ''}
                    </Typography>
                </Box>

                <Box sx={{marginLeft: 'auto'}}>
                    <Typography sx={{textAlign: "right"}}>
                        <b>Ostatnia aktywność:</b>
                        <em>
                            <br/> {device.lastUpdated ? formatDistance(new Date(device.lastUpdated), new Date(), {
                            addSuffix: true,
                            locale: pl
                        }) : 'Brak aktywności'}
                        </em>
                    </Typography>
                </Box>
            </Box>

            <Box>
                {device.isConfigured}
                {device.sensorNumber}
                {device.type}

            </Box>


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
                    <Tab label="Światło" value="LIGHT" icon={<LightbulbOutlined/>} iconPosition="start"/>
                    <Tab label="Wilgotność" value="HUMIDITY" icon={<OpacityOutlined/>} iconPosition="start"/>
                    <Tab label="Ciągłe" value="CONTINUOUS" icon={<ShowChartOutlined/>} iconPosition="start"/>
                    <Tab label="Inne" value="OTHER" icon={<MoreHorizOutlined/>} iconPosition="start"/>
                </Tabs>
            </Paper>

            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                            <Skeleton variant="rectangular" height={200} sx={{borderRadius: 2}}/>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <>
                    {filteredSensors.length === 0 ? (
                        <Box sx={{
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
                        <Grid container spacing={3}>
                            {filteredSensors.map((sensor) => (
                                <Grid item xs={12} sm={6} md={4} key={sensor.sensor_id}>
                                    <StyledCard>
                                        <CardContent sx={{flexGrow: 1}} onClick={()=> navigate(`/sensor/${sensor.sensor_id}`)}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                <Box>
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
                                                    {Math.round(sensor.lastValue.value*100)/100 || '--'}
                                                    <Typography variant="body1" component="span" color="text.secondary">
                                                        {sensor.unit ? ` ${sensor.unit}` : ''}
                                                    </Typography>
                                                </Typography>
                                                {sensor.data_type === 'HUMIDITY' && (
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={sensor.current_value}
                                                        color={sensor.current_value > 70 ? 'error' : sensor.current_value < 30 ? 'warning' : 'primary'}
                                                        sx={{mt: 2, height: 8, borderRadius: 4}}
                                                    />
                                                )}
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Chip
                                                    label={sensor.device?.name || 'Nieznane urządzenie'}
                                                    size="small"
                                                    variant="outlined"
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
        </Container>
    );
};

export default DevicePage;