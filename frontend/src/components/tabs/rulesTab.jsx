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
    TablePagination, ListItemText, ListItem, List
} from '@mui/material';

import {
    CheckBox,
    CheckBoxOutlineBlank,
    Circle,
    DateRange, ExpandMore,
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


const RulesTab = ({rules, setRules, devices, sensors, type}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSensors, setSelectedSensors] = useState(type === "sensor" ? sensors : []);
    const [selectedDevices, setSelectedDevices] = useState(type === "device" ? devices : []);
    const [filteredSensors, setFilteredSensors] = useState(sensors);
    const navigate = useNavigate()
    const [openDialogMore, setOpenDialogMore] = useState(false);

    // Połącz wszystkie elementy w jedną tablicę z typem
    const allItems = (rule) => [
        ...rule.sensors.map(s => ({...s, type: 'sensor'})),
        ...rule.devices.map(d => ({...d, type: 'device'})),
        ...rule.locations.map(l => ({...l, type: 'location'})),
        ...rule.rooms.map(r => ({...r, type: 'room'})),
        ...rule.floors.map(f => ({...f, type: 'floor'}))
    ];

    const renderChip = (item) => {
        const commonProps = {
            key: item.id || item.sensor_id || item.device_id,
            size: "small",
            variant: "outlined",
            sx: {margin: '2px'}
        };

        switch (item.type) {
            case 'sensor':
                return (
                    <Chip
                        {...commonProps}
                        label={item.name}
                        onClick={() => navigate(`/sensor/${item.sensor_id}`)}
                    />
                );
            case 'device':
                return (
                    <Chip
                        {...commonProps}
                        label={item.name}
                        onClick={() => navigate(`/device/${item.device_id}`)}
                    />
                );
            case 'location':
                return <Chip {...commonProps} label={item.name}/>;
            case 'room':
                return <Chip {...commonProps} label={item.name} color="primary"/>;
            case 'floor':
                return <Chip {...commonProps} label={item.name} color="secondary"/>;
            default:
                return null;
        }
    };

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
        recurrentTime: ''
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

        if (name === "actionType") {
            let temp;
            if (value === "SET") {
                temp = sensors?.filter((f) => f.data_type === "WORKER" || f.data_type === "TEMPERATURE" ||
                    f.data_type === "LIGHT")
            } else if (value === "LIMIT") {
                temp = sensors?.filter((f) => f.data_type === "HUMIDITY" || f.data_type === "ENERGY" ||
                    f.data_type === "TEMPERATURE" || f.data_type === "CONTINUOUS" || f.data_type === "DISCRETE")
            }
            setFilteredSensors(temp)
            setSelectedSensors([])
            setSelectedDevices([])
        }
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
        setSelectedDevices([])
        setSelectedSensors([])
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
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                                                {allItems(rule).slice(0, 2).map(item => renderChip(item))}

                                                {/* Jeśli jest więcej niż 2 elementy, pokaż przycisk "więcej" */}
                                                {allItems(rule).length > 2 && (
                                                    <>
                                                        <Button
                                                            size="small"

                                                            startIcon={<ExpandMore/>}
                                                            onClick={() => setOpenDialogMore(true)}
                                                            sx={{minWidth: 0, padding: '4px'}}
                                                        >
                                                            +{allItems(rule).length - 2}
                                                        </Button>

                                                        <Dialog open={openDialogMore}
                                                                onClose={() => setOpenDialogMore(false)} maxWidth="sm"
                                                                fullWidth>
                                                            <DialogTitle>Wszystkie powiązane elementy</DialogTitle>
                                                            <DialogContent>
                                                                <List>
                                                                    {allItems(rule).map((item) => (
                                                                        <ListItem
                                                                            key={item.id || item.sensor_id || item.device_id}>
                                                                            <Chip onClick={()=> navigate(`/sensor/${item.sensor_id}`)}
                                                                                label={item.visibleName || item.name}
                                                                            />
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button
                                                                    onClick={() => setOpenDialogMore(false)}>Zamknij</Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    </>
                                                )}
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
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenDialog(true)}
                    >
                        Dodaj nową regułę
                    </Button>
                </Box>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Dodaj nową regułę</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                label="Nazwa reguły"
                                name="name"
                                value={newRule.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>Typ akcji *</InputLabel>
                                <Select
                                    value={newRule.actionType || ''}
                                    onChange={handleInputChange}
                                    name="actionType"
                                    required
                                >
                                    {type === "sensor" ? (
                                        (sensors.length === 1 && sensors[0].data_type !== "LIGHT" && sensors[0].data_type !== "ROBOT") ? (
                                            <MenuItem value="LIMIT">Ogranicz</MenuItem>
                                        ) : null
                                    ) : (
                                        <MenuItem value="LIMIT">Ogranicz</MenuItem>
                                    )}

                                    {type === "sensor" ? (
                                        (sensors.length === 1 && (sensors[0].data_type === "LIGHT" || sensors[0].data_type === "ROBOT" || sensors[0].data_type === "TEMPERATURE")) ? (
                                            <MenuItem value="SET">Ustaw</MenuItem>
                                        ) : null
                                    ) : (
                                        <MenuItem value="SET">Ustaw</MenuItem>
                                    )}

                                    {type !== "sensor" && <MenuItem value="ON/OFF">Włącz/wyłącz</MenuItem>}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 11}}>
                            {newRule.actionType === "ON/OFF" ?
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
                                /> :

                                <Autocomplete
                                    multiple
                                    limitTags={2}
                                    id="sensors-multi-select"
                                    options={filteredSensors}
                                    getOptionLabel={(option) => option.visibleName}
                                    value={selectedSensors}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Wybierz czujniki" placeholder="Wyszukaj..."/>
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
                                            {option.visibleName}
                                        </li>
                                    )}
                                    onChange={(event, newValue) => {
                                        console.log(newValue)
                                        setSelectedSensors(newValue);
                                        setNewRule(prev => ({...prev, sensors: newValue}));
                                    }}
                                />}
                        </Grid>

                        <Grid size={{xs: 1}} sx={{alignContent: "center"}}>
                            <Tooltip title="Wybierz wszystkie" arrow>
                                <IconButton onClick={() => {
                                    setSelectedSensors(filteredSensors)
                                    setNewRule(prev => ({...prev, sensors: filteredSensors}))
                                }}>
                                    <Grading/>
                                </IconButton>
                            </Tooltip>
                        </Grid>


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

export default RulesTab;