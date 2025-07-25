import React, {useState} from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Box,
    Chip,
    Autocomplete,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from '@mui/material';

import {
    CheckBox,
    CheckBoxOutlineBlank,
    Circle,
    DateRange,
    Grading,
    InfoOutlined,
    Layers,
    Memory
} from "@mui/icons-material";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {pl} from "date-fns/locale";
import {useNavigate} from "react-router-dom";


const RulesTabLR = ({rules, setRules, rooms, devices, locations, type}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState(type==="room"? rooms: []);
    const [selectedDevices, setSelectedDevices] = useState([]);
    // const [filteredSensors, setFilteredSensors] = useState(sensors);
    const navigate = useNavigate()

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [newRule, setNewRule] = useState({
        name: '',
        locations: [],
        rooms: [],
        floors: [],
        sensors: [],
        devices: [],
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
        value_low: '',
        value_high: '',
        isRecurrent: false,
        actionType: 'LIMIT',
        recurrentTime: '',
        mainType: ''
    });

    const recurrencyTypes = [
        {value: '1', label: 'Co godzinę'},
        {value: '2', label: 'Codziennie'},
        {value: '3', label: 'Co tydzień'},
        {value: '4', label: 'Co miesiąc'},
        {value: '5', label: 'Co rok'}
    ];
    const token = localStorage.getItem("access");

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewRule(prev => ({...prev, [name]: value}));

    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setNewRule(prev => ({...prev, [name]: checked}));
    };

    const handleSubmit = async () => {
        const response = await client.post(API_BASE_URL + `newRule/`,
            {
                newRule: newRule,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setRules(prev => [...prev, response.data]);

        setOpenDialog(false);
        setNewRule({
            name: '',
            locations: [],
            rooms: [],
            floors: [],
            sensors: [],
            devices: [],
            start_date: new Date(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
            value_low: '',
            value_high: '',
            isRecurrent: false,
            actionType: 'LIMIT',
            recurrentTime: ''
        });
        setSelectedRooms(type==="room"? rooms: [])
        // setSelectedSensors([])
    };

    const handleDateChange = (name, date) => {
        setNewRule(prev => ({...prev, [name]: date}));
        console.log(date)
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            {rules.length > 0 ? (
                <Box sx={{width: '100%'}}>
                    <TableContainer component={Paper} sx={{border: "1px solid #00000020", mt: 1}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nazwa</TableCell>
                                    <TableCell>Typ</TableCell>
                                    <TableCell>Wartość</TableCell>
                                    <TableCell>Czas rozpoczęcia</TableCell>
                                    <TableCell>Częstotliwość</TableCell>
                                    <TableCell>Wpływa na</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rule) => (
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
                                                {rule.sensors.map(sensor => (
                                                    <Chip
                                                        key={sensor.sensor_id}
                                                        label={sensor.name}
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => navigate(`/sensor/${sensor.sensor_id}`)}
                                                    />
                                                ))}
                                                {rule.locations.map(loc => (
                                                    <Chip key={loc.id} label={loc.name} size="small"/>
                                                ))}
                                                {rule.rooms.map(room => (
                                                    <Chip key={room.id} label={room.name} size="small" color="primary"/>
                                                ))}
                                                {rule.floors.map(floor => (
                                                    <Chip key={floor.id} label={floor.name} size="small"
                                                          color="secondary"/>
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {rule.isActive ?
                                                <Tooltip title={"Aktywna"} arrow>
                                                    <Circle color={"success"}/>
                                                </Tooltip>
                                                :
                                                <Tooltip title={"Nieaktywna"} arrow>
                                                    <Circle color={"action"}/>
                                                </Tooltip>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={rules.length}
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
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: '300px',
                        textAlign: 'center',
                        p: 3,
                        borderRadius: 1,
                    }}
                >
                    <InfoOutlined color="disabled" sx={{fontSize: 48, mb: 2}}/>
                    <Typography variant="h6" color="text.secondary">
                        Nie masz jeszcze żadnych reguł
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Utwórz nową regułę, która się tu pojawi.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenDialog(true)}
                        sx={{mt: 2}}
                    >
                        Dodaj nową regułę
                    </Button>
                </Box>
            )}

            {rules.length > 0 && (
                <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenDialog(true)}
                    >
                        Dodaj nową regułę
                    </Button>
                </Box>
            )}

            {/* Dialog do dodawania nowej reguły */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Dodaj nową regułę</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid size={{xs: 12, sm: 4}}>
                            <TextField
                                fullWidth
                                label="Nazwa reguły"
                                name="name"
                                value={newRule.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 4}}>
                            <FormControl fullWidth>
                                <InputLabel>Typ mierzony *</InputLabel>
                                <Select
                                    value={newRule.mainType}
                                    onChange={handleInputChange}
                                    name="mainType"
                                    required
                                >
                                    <MenuItem value="ENERGY">Zużycie energii</MenuItem>
                                    <MenuItem value="TEMPERATURE">Temperatura</MenuItem>
                                    <MenuItem value="LIGHT">Oświetlenie</MenuItem>

                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, sm: 4}}>
                            <FormControl fullWidth>
                                <InputLabel>Typ akcji *</InputLabel>
                                <Select
                                    value={newRule.actionType || ''}
                                    onChange={handleInputChange}
                                    name="actionType"
                                    required
                                >

                                    {newRule.mainType === "ENERGY" || newRule.mainType === "TEMPERATURE" && (
                                        <MenuItem value="LIMIT">Ogranicz</MenuItem>
                                    )}

                                    {newRule.mainType === "LIGHT" || newRule.mainType === "TEMPERATURE" && (
                                        <MenuItem value="SET">Ustaw</MenuItem>
                                    )}

                                    <MenuItem value="ON/OFF">Włącz/wyłącz</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 11}}>
                            {newRule.actionType === "ON/OFF" &&
                                <Autocomplete
                                    multiple
                                    limitTags={2}
                                    id="sensors-multi-select"
                                    options={devices}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedDevices}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Wybierz urządzenie" placeholder="Wyszukaj..."/>
                                    )}
                                    sx={{width: '100%'}}
                                    disableCloseOnSelect
                                    renderOption={(props, option, {selected}) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={<CheckBoxOutlineBlank fontSize="small"/>}
                                                checkedIcon={<CheckBox fontSize="small"/>}
                                                style={{marginRight: 8}}
                                                checked={selected}
                                            />
                                            {option.name}
                                        </li>
                                    )}
                                    onChange={(event, newValue) => {
                                        setSelectedDevices(newValue);

                                    }}
                                />}
                        </Grid>

                        {newRule.actionType === "ON/OFF" &&
                        <Grid size={{xs: 1}} sx={{alignContent: "center"}}>
                            <Tooltip title="Wybierz wszystkie" arrow>
                                <IconButton onClick={() => setSelectedDevices(devices)}>
                                    <Grading/>
                                </IconButton>
                            </Tooltip>
                        </Grid>}


                        <Grid size={{xs: 12, sm: 6}}>
                            <DateTimePicker
                                label="Data rozpoczęcia"
                                value={new Date(newRule.start_date)}
                                onChange={(date) => handleDateChange('start_date', date)}
                                renderInput={(params) => <TextField {...params} fullWidth/>}
                                sx={{width: '100%'}}
                            />
                        </Grid>

                        {(newRule.actionType === "LIMIT" || newRule.actionType === "") &&
                            (<Grid size={{xs: 12, sm: 6}}>
                                <DateTimePicker
                                    label="Data zakończenia (opcjonalnie)"
                                    value={new Date(newRule.end_date)}
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                    sx={{width: '100%'}}
                                />
                            </Grid>)}

                        {newRule.actionType !== "ON/OFF" ?
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label={newRule.actionType === "SET" ? "Wartość" : "Wartość minimalna (opcjonalnie)"}
                                    name="value_low"
                                    value={newRule.value_low}
                                    onChange={handleInputChange}
                                />
                            </Grid> :
                            <Grid size={{xs: 12, sm: 6}}>
                                <FormControl fullWidth>
                                    <InputLabel>Stan *</InputLabel>
                                    <Select
                                        value={newRule.value_low || ''}
                                        onChange={handleInputChange}
                                        name="value_low"
                                        required
                                    >
                                        <MenuItem value={"ON"}>Włącz</MenuItem>
                                        <MenuItem value={"OFF"}>Wyłącz</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>}

                        {(newRule.actionType === "LIMIT" || newRule.actionType === "") &&
                            (<Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Wartość maksymalna (opcjonalnie)"
                                    name="value_high"
                                    value={newRule.value_high}
                                    onChange={handleInputChange}
                                />
                            </Grid>)}

                        <Grid size={{xs: 12}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={newRule.isRecurrent}
                                        onChange={handleCheckboxChange}
                                        name="isRecurrent"
                                    />
                                }
                                label="Reguła cykliczna"
                            />
                        </Grid>

                        {newRule.isRecurrent && (
                            <Grid size={{xs: 12}}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Częstotliwość"
                                    name="recurrentTime"
                                    value={newRule.recurrentTime}
                                    onChange={handleInputChange}
                                >
                                    {recurrencyTypes.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        Zapisz regułę
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default RulesTabLR;