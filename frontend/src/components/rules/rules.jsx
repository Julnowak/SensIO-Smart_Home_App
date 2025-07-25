import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Chip,
    Divider,
    Tabs,
    Tab,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormGroup,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
} from '@mui/material';
import {
    AddCircleOutline,
    DeleteOutline,
    EditOutlined,
    ScheduleOutlined,
    RuleFolderOutlined,
    DateRange,
    AccessTime,
    WorkHistory,
    Info,
    InfoOutline
} from '@mui/icons-material';
import {LocalizationProvider, DateTimePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {pl} from 'date-fns/locale';
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import {useNavigate} from "react-router-dom";

const Rules = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("access");
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRule, setCurrentRule] = useState({
        name: '',
        locations: [],
        rooms: [],
        floors: [],
        start_date: new Date(),
        end_date: null,
        value_low: '',
        value_high: '',
        isRecurrent: false,
        recurrentTime: ''
    });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "rules/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRules(response.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const activeRules = rules.filter((r) => r.isActive);
    const inactiveRules = rules.filter((r) => !r.isActive);
    const navigate = useNavigate()
    const [locations, setLocations] = useState([
        {id: 1, name: 'Dom główny'},
        {id: 2, name: 'Biurowiec'}
    ]);

    const [rooms, setRooms] = useState([
        {id: 1, name: 'Salon'},
        {id: 2, name: 'Kuchnia'},
        {id: 3, name: 'Sypialnia'}
    ]);

    const [floors, setFloors] = useState([
        {id: 1, name: 'Parter'},
        {id: 2, name: 'Pierwsze piętro'}
    ]);

    const recurrenceTypes = [
        {value: '1', label: 'Godzinowo'},
        {value: '2', label: 'Dziennie'},
        {value: '3', label: 'Tygodniowo'},
        {value: '4', label: 'Miesięcznie'},
        {value: '5', label: 'Rocznie'}
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPage(0); // Reset page when changing tabs
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setCurrentRule(prev => ({...prev, [name]: value}));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setCurrentRule(prev => ({...prev, [name]: checked}));
    };

    const handleDateChange = (name, value) => {
        setCurrentRule(prev => ({...prev, [name]: value}));
    };

    const handleSelectChange = (e) => {
        const {name, value} = e.target;
        setCurrentRule(prev => ({...prev, [name]: value}));
    };

    const toggleLocation = (location) => {
        setCurrentRule(prev => {
            const isSelected = prev.locations.some(l => l.id === location.id);
            return {
                ...prev,
                locations: isSelected
                    ? prev.locations.filter(l => l.id !== location.id)
                    : [...prev.locations, location]
            };
        });
    };

    const toggleRoom = (room) => {
        setCurrentRule(prev => {
            const isSelected = prev.rooms.some(r => r.id === room.id);
            return {
                ...prev,
                rooms: isSelected
                    ? prev.rooms.filter(r => r.id !== room.id)
                    : [...prev.rooms, room]
            };
        });
    };

    const toggleFloor = (floor) => {
        setCurrentRule(prev => {
            const isSelected = prev.floors.some(f => f.id === floor.id);
            return {
                ...prev,
                floors: isSelected
                    ? prev.floors.filter(f => f.id !== floor.id)
                    : [...prev.floors, floor]
            };
        });
    };

    const recurrencyTypes = [
        {value: '1', label: 'Co godzinę'},
        {value: '2', label: 'Codziennie'},
        {value: '3', label: 'Co tydzień'},
        {value: '4', label: 'Co miesiąc'},
        {value: '5', label: 'Co rok'}
    ];

    const handleSubmit = () => {
        if (currentRule.id) {
            setRules(rules.map(r => (r.id === currentRule.id ? currentRule : r)));
        } else {
            const newRule = {...currentRule, id: rules.length + 1};
            setRules([...rules, newRule]);
        }
        setOpenDialog(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentRule({
            name: '',
            locations: [],
            rooms: [],
            floors: [],
            start_date: new Date(),
            end_date: null,
            value_low: '',
            value_high: '',
            isRecurrent: false,
            recurrentTime: ''
        });
    };

    const editRule = (rule) => {
        setCurrentRule(rule);
        setOpenDialog(true);
    };

    const deleteRule = (id) => {
        setRules(rules.filter(rule => rule.id !== id));
    };

    const currentRules = activeTab === 0 ? activeRules : inactiveRules;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, currentRules.length - page * rowsPerPage);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Typography variant="h4" component="h1" sx={{fontWeight: 600}}>
                        Zasady i harmonogramy
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutline/>}
                        onClick={() => setOpenDialog(true)}
                    >
                        Nowa zasada
                    </Button>
                </Box>

                <Paper sx={{p: 2, border: "1px solid #00000020",}}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Aktywne" icon={<WorkHistory/>}/>
                        <Tab label="Nieaktywne" icon={<ScheduleOutlined/>}/>
                    </Tabs>
                    <Divider sx={{mb: 2}}/>

                    {currentRules.length === 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                py: 8,
                                color: 'text.secondary'
                            }}
                        >
                            {activeTab === 0 ? (
                                <>
                                    <ScheduleOutlined sx={{fontSize: 60, mb: 2}}/>
                                    <Typography variant="h6">Brak zdefiniowanych zasad</Typography>
                                    <Typography variant="body1" sx={{mt: 1}}>
                                        Kliknij przycisk "Nowa zasada", aby dodać pierwszą zasadę
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <InfoOutline sx={{fontSize: 60, mb: 2}}/>
                                    <Typography variant="h6">Brak zasad do wyświetlenia</Typography>
                                    <Typography variant="body1" sx={{mt: 1}}>
                                        Po dodaniu i aktywowaniu zasady, pojawią się tu zakończone reguły
                                    </Typography>
                                </>
                            )}
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nazwa</TableCell>
                                            <TableCell>Typ</TableCell>
                                            <TableCell>Wartość</TableCell>
                                            <TableCell>Czas rozpoczęcia</TableCell>
                                            <TableCell>Częstotliwość</TableCell>
                                            <TableCell>Wpływa na</TableCell>
                                            <TableCell>Akcje</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentRules
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((rule) => (
                                                <TableRow key={rule.id}>
                                                    <TableCell>{rule.name}</TableCell>
                                                    <TableCell>
                                                        {rule.type}
                                                    </TableCell>
                                                    <TableCell>
                                                        {rule.type === "LIMIT" ?
                                                            (<>
                                                                Min. {rule.value_low}
                                                                <br/>
                                                                Max. {rule.value_high}
                                                            </>) :
                                                            (rule.type === "SET" ? `${rule.value_low}` : (rule.value_low === 1 ? "włączone" : "wyłączone"))
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <DateRange fontSize="small"
                                                                       sx={{mr: 1, color: 'text.secondary'}}/>
                                                            <Box>
                                                                {rule.start_date || rule.end_date ? (
                                                                    <>
                                                                        <Typography variant="body2">
                                                                            {rule.type === "LIMIT" && "Od: "}
                                                                            {new Date(rule.start_date).toLocaleString()}
                                                                        </Typography>

                                                                        {rule.type === "LIMIT" && rule.end_date && (
                                                                            <Typography variant="body2">
                                                                                {rule.type === "LIMIT" && "Do: "}
                                                                                {new Date(rule.end_date).toLocaleString()}
                                                                            </Typography>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Typography variant="body2" color="text.disabled">
                                                                        ---
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell>
                                                        {rule.isRecurrent ?
                                                            recurrencyTypes.find(t => t.value === rule.recurrentTime)?.label :
                                                            'Jednorazowo'}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                            {rule.locations.map(location => (
                                                                <Chip key={location.id} label={location.name}
                                                                      size="small"/>
                                                            ))}
                                                            {rule.floors.map(floor => (
                                                                <Chip key={floor.id} label={floor.name} size="small"
                                                                      color="secondary"/>
                                                            ))}
                                                            {rule.rooms.map(room => (
                                                                <Chip key={room.id} label={room.name} size="small"
                                                                      color="primary"/>
                                                            ))}
                                                            {rule.sensors.map(sensor => (
                                                                <Chip key={sensor.sensor_id} label={sensor.visibleName} onClick={()=> navigate(`/sensor/${sensor.sensor_id}`)} size="small"
                                                                      color="primary" variant="outlined"/>
                                                            ))}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={() => editRule(rule)}>
                                                            <EditOutlined/>
                                                        </IconButton>
                                                        <IconButton onClick={() => deleteRule(rule.id)}>
                                                            <DeleteOutline/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        {emptyRows > 0 && (
                                            <TableRow style={{height: 53 * emptyRows}}>
                                                <TableCell colSpan={5}/>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15]}
                                component="div"
                                count={currentRules.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                    '& .MuiTablePagination-toolbar': {
                                        display: 'flex',
                                        alignItems: 'center',

                                    },
                                    '& .MuiTablePagination-selectLabel': {
                                        margin: 0,
                                        padding: 0,
                                    }, '& .MuiTablePagination-displayedRows': {
                                        margin: 0,
                                        padding: 0,
                                    },

                                }}
                                labelRowsPerPage={"Wyniki na stronę:"}
                                labelDisplayedRows={({from, to, count}) =>
                                    `${from}–${to} z ${count !== -1 ? count : `ponad ${to}`}`
                                }
                            />
                        </>
                    )}
                </Paper>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {currentRule.id ? 'Edytuj zasadę' : 'Dodaj nową zasadę'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nazwa zasady"
                                    name="name"
                                    value={currentRule.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{mb: 1}}>
                                    Lokalizacje
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {locations.map(location => (
                                        <Chip
                                            key={location.id}
                                            label={location.name}
                                            onClick={() => toggleLocation(location)}
                                            color={currentRule.locations.some(l => l.id === location.id) ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{mb: 1}}>
                                    Piętra
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {floors.map(floor => (
                                        <Chip
                                            key={floor.id}
                                            label={floor.name}
                                            onClick={() => toggleFloor(floor)}
                                            color={currentRule.floors.some(f => f.id === floor.id) ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{mb: 1}}>
                                    Pomieszczenia
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {rooms.map(room => (
                                        <Chip
                                            key={room.id}
                                            label={room.name}
                                            onClick={() => toggleRoom(room)}
                                            color={currentRule.rooms.some(r => r.id === room.id) ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="Data rozpoczęcia"
                                    value={new Date(currentRule.start_date)}
                                    onChange={(date) => handleDateChange('start_date', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="Data zakończenia (opcjonalnie)"
                                    value={new Date(currentRule.end_date)}
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Wartość minimalna (opcjonalnie)"
                                    name="value_low"
                                    value={currentRule.value_low}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Wartość maksymalna (opcjonalnie)"
                                    name="value_high"
                                    value={currentRule.value_high}
                                    onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="isRecurrent"
                                            checked={currentRule.isRecurrent}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Zasada cykliczna"
                                />
                            </Grid>

                            {currentRule.isRecurrent && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Częstotliwość</InputLabel>
                                        <Select
                                            name="recurrentTime"
                                            value={currentRule.recurrentTime}
                                            label="Częstotliwość"
                                            onChange={handleSelectChange}
                                            required
                                        >
                                            {recurrenceTypes.map(type => (
                                                <MenuItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            {currentRule.id ? 'Zapisz zmiany' : 'Dodaj zasadę'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
};

export default Rules;