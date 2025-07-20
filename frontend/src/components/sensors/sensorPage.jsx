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
    Checkbox
} from '@mui/material';
import {
    RefreshOutlined,
    ShowChart as ShowChartIcon,
    TableChart as TableChartIcon,
    Sensors,
    Star,
    EditOutlined,
    Delete,
    Warning,
    ListAlt,
    CheckCircleOutline,
    RadioButtonChecked,
    RemoveCircleOutline
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {format, formatDistance} from 'date-fns';
import {pl} from 'date-fns/locale';
import SensorChart from "./sensorChart.jsx";
import RulesTab from "../tabs/rulesTab.jsx";
import AlarmsTab from "../tabs/alarmsTab.jsx";


const StyledCard = styled(Card)(({theme}) => ({
    height: '100%',border: "1px solid #00000020", display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': {
        transform: 'scale(1.02)', boxShadow: theme.shadows[4]
    }
}));

const SensorPage = () => {
    const [sensor, setSensor] = useState(null);
    const [measurements, setMeasurements] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('chart');
    const [timeRange, setTimeRange] = useState('24h');
    const params = useParams();
    const token = localStorage.getItem("access");
    const [filteredMeasurements, setFilteredMeasurements] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        locations: [],
        rooms: [],
        floors: [],
        sensors: [],
        start_date: new Date().toISOString().slice(0, 16),
        end_date: '',
        value_low: '',
        value_high: '',
        isRecurrent: false,
        recurrentTime: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Pobierz dane czujnika
            const response = await client.get(`${API_BASE_URL}sensor/${params.id}/`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setSensor(response.data.sensorData);
            setMeasurements(response.data.measurementData);
            setAlarms(response.data.actionsData)
            setRules(response.data.rulesData)
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
            ...prev, [name]: value,
        }));

    };

    const handleSubmit = async () => {
        try {
            const response = await client.put(`${API_BASE_URL}sensor/${sensor.id}/`, formData, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setSensor(response.data);
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        } finally {
            setOpen(!open)
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

// Wywołaj filtrowanie przy pierwszym renderowaniu i przy zmianie danych
    useEffect(() => {
        filterMeasurements(timeRange);
    }, [measurements, timeRange]);

    const dataTypes = [{value: 'LIGHT', label: 'Światło'}, {value: 'HUMIDITY', label: 'Wilgotność'}, {
        value: 'ENERGY',
        label: 'Zużycie energii'
    }, {value: 'TEMPERATURE', label: 'Temperatura'}, {value: 'CONTINUOUS', label: 'Ciągłe'}, {
        value: 'DISCRETE',
        label: 'Dyskretne'
    }, {value: 'OTHER', label: 'inne/różne'},];

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
        return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60}/>
            </Box>);
    }


    const recurrencyTypes = [{value: '1', label: 'godzinowo'}, {value: '2', label: 'dziennie'}, {
        value: '3',
        label: 'tygodniowo'
    }, {value: '4', label: 'miesięcznie'}, {value: '5', label: 'rocznie'}];

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewRule(prev => ({...prev, [name]: value}));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setNewRule(prev => ({...prev, [name]: checked}));
    };

    const handleArrayChange = (name, value) => {
        setNewRule(prev => ({
            ...prev, [name]: typeof value === 'string' ? value.split(',') : value
        }));
    };

    const handleSubmitRule = () => {
        // Tutaj logika wysyłania nowej reguły do API
        console.log('New rule:', newRule);
        setOpenDialog(false);
        // Reset formularza
        setNewRule({
            name: '',
            locations: [],
            rooms: [],
            floors: [],
            sensors: [],
            start_date: new Date().toISOString().slice(0, 16),
            end_date: '',
            value_low: '',
            value_high: '',
            isRecurrent: false,
            recurrentTime: ''
        });
    };


    return (<Box sx={{p: 3}}>
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid size={{xs: 12, md: 6}}>
                    <StyledCard>
                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                <Avatar sx={{
                                    bgcolor: sensor?.device.color, mr: 2, width: 56, height: 56
                                }}>
                                    <Sensors/>
                                </Avatar>


                                <Box>
                                    <Typography variant="h4" component="h1">
                                        {sensor?.visibleName || sensor?.name}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {getDataTypeLabel(sensor?.data_type)} • {sensor?.device?.name}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    mb: 1
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <Tooltip title="Odśwież">
                                            <IconButton
                                                // onClick={handleRefresh}
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
                                        <Tooltip title="Edytuj">
                                            <IconButton
                                                onClick={() => {
                                                    setFormData({
                                                        ...sensor, room: sensor.room ? sensor.room.room_id : sensor.room
                                                    });
                                                    setOpen(!open);
                                                }}
                                                size="small"
                                                sx={{
                                                    color: 'text.secondary', '&:hover': {
                                                        color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                    }
                                                }}
                                            >
                                                <EditOutlined fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Usuń">
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
                                                    color: 'text.secondary', '&:hover': {
                                                        color: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                    }
                                                }}
                                            >
                                                <Delete fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                            </Box>


                            <Divider sx={{my: 2}}/>

                            <Grid container spacing={2}>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Pokój
                                    </Typography>
                                    <Typography variant="body1">
                                        {sensor?.room?.name || 'Nie przypisano'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Nr seryjny
                                    </Typography>
                                    <Typography variant="body1">
                                        {sensor?.serial_number || 'Nieznany'}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Typ danych
                                    </Typography>
                                    <Typography variant="body1">
                                        {getDataTypeLabel(sensor?.data_type)}
                                    </Typography>
                                </Grid>
                                <Grid size={{xs: 6}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Jednostka
                                    </Typography>
                                    <Typography variant="body1">
                                        {sensor?.unit || 'brak'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                    <StyledCard>
                        <CardContent sx={{height: '100%'}}>
                            <Typography variant="h6" gutterBottom>
                                Ostatni odczyt
                            </Typography>
                            {measurements.length > 0 ? (<>
                                    <Box sx={{display: 'flex', alignItems: 'baseline', mb: 2}}>
                                        <Typography variant="h3" sx={{mr: 1}}>
                                            {Math.round(measurements[0].value * 100) / 100}
                                        </Typography>
                                        <Typography variant="h5" color="text.secondary">
                                            {sensor?.unit}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(measurements[0].created_at), 'PPpp', {locale: pl})}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        ({formatDistance(new Date(measurements[0].created_at), new Date(), {
                                        addSuffix: true, locale: pl
                                    })})
                                    </Typography>
                                </>) : (<Typography variant="body1" color="text.secondary">
                                    Brak danych pomiarowych
                                </Typography>)}
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            <Paper sx={{mb: 3, border: "1px solid #00000020", borderRadius: 2}}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab label="Wykres" value="chart" icon={<ShowChartIcon/>}/>
                    <Tab label="Tabela" value="table" icon={<TableChartIcon/>}/>
                    <Tab label="Zasady" value="rules" icon={<ListAlt/>}/>
                </Tabs>
            </Paper>

            {activeTab === 'chart' && (<StyledCard sx={{mb: 3}}>
                    <CardContent>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6">
                                Historia pomiarów
                            </Typography>
                            <Tabs
                                value={timeRange}
                                onChange={handleTimeRangeChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                size="small"
                            >
                                <Tab label="24h" value="24h"/>
                                <Tab label="7 dni" value="7d"/>
                                <Tab label="30 dni" value="30d"/>
                                <Tab label="Wszystkie" value="all"/>
                            </Tabs>


                        </Box>
                        {measurements && <SensorChart measurements={filteredMeasurements}/>}
                    </CardContent>
                </StyledCard>)}

            {activeTab === 'table' && (
                <AlarmsTab alarms={alarms} loading={loading} type={"sensor"} />

                )}

            <>
      {activeTab === 'rules' && (
          <RulesTab  rules={rules}  />
      )}

      {/* Przycisk dodawania nowej reguły (widoczny gdy są już jakieś reguły) */}
      {rules.length > 0 && activeTab === 'rules' && (<Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
              >
                  Dodaj nową regułę
              </Button>
          </Box>)}

      {/* Dialog do dodawania nowej reguły */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>Dodaj nową regułę</DialogTitle>
              <DialogContent>
                  <Grid container spacing={2} sx={{mt: 1}}>
                      <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Nazwa reguły"
                              name="name"
                              value={newRule.name}
                              onChange={handleInputChange}
                              required
                          />
                      </Grid>

                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              label="Data rozpoczęcia"
                              type="datetime-local"
                              name="start_date"
                              value={newRule.start_date}
                              onChange={handleInputChange}
                              InputLabelProps={{shrink: true}}
                          />
                      </Grid>

                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              label="Data zakończenia (opcjonalnie)"
                              type="datetime-local"
                              name="end_date"
                              value={newRule.end_date}
                              onChange={handleInputChange}
                              InputLabelProps={{shrink: true}}
                          />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                          <TextField
                              fullWidth
                              label="Wartość minimalna (opcjonalnie)"
                              name="value_low"
                              value={newRule.value_low}
                              onChange={handleInputChange}
                          />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                          <TextField
                              fullWidth
                              label="Wartość maksymalna (opcjonalnie)"
                              name="value_high"
                              value={newRule.value_high}
                              onChange={handleInputChange}
                          />
                      </Grid>

                      <Grid item xs={12}>
                          <FormControlLabel
                              control={<Checkbox
                                  checked={newRule.isRecurrent}
                                  onChange={handleCheckboxChange}
                                  name="isRecurrent"
                              />}
                              label="Reguła cykliczna"
                          />
                      </Grid>

                      {newRule.isRecurrent && (<Grid item xs={12}>
                              <TextField
                                  select
                                  fullWidth
                                  label="Częstotliwość"
                                  name="recurrentTime"
                                  value={newRule.recurrentTime}
                                  onChange={handleInputChange}
                              >
                                  {recurrencyTypes.map((option) => (<MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                      </MenuItem>))}
                              </TextField>
                          </Grid>)}
                  </Grid>
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
                  <Button onClick={handleSubmit} color="primary" variant="contained">
                      Zapisz regułę
                  </Button>
              </DialogActions>
          </Dialog>
            </>

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
                                {dataTypes.map((type) => (<MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>))}
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
                    <Button onClick={() => handleSubmit} variant="contained" color="primary">
                        {'Zapisz'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>);
};

export default SensorPage;