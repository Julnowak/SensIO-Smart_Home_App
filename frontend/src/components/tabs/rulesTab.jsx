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
    Chip, Autocomplete, IconButton, FormControl, InputLabel, Select, Tooltip
} from '@mui/material';

import {CheckBox, CheckBoxOutlineBlank, Grading, InfoOutlined, Layers, Memory} from "@mui/icons-material";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {pl} from "date-fns/locale";

const icon = <CheckBoxOutlineBlank fontSize="small"/>;
const checkedIcon = <CheckBox fontSize="small"/>;

const SensorMultiSelect = ({sensors, selectedSensors, onSensorChange}) => {
    const [inputValue, setInputValue] = useState('');

    const allOption = {sensor_id: "all", visibleName: "Wszystkie"};
    const options = [allOption, ...sensors];

    const handleChange = (event, newValue) => {
        // Jeśli wybrano "Wszystkie" i nie były wcześniej wszystkie wybrane
        if (newValue.find(option => option.sensor_id === "all") && !selectedSensors.includes("all")) {
            onSensorChange([allOption, ...sensors]);
            return;
        }

        // Jeśli odznaczono "Wszystkie"
        if (!newValue.find(option => option.sensor_id === "all") && selectedSensors.includes("all")) {
            onSensorChange([]);
            return;
        }

        // Normalna zmiana wyboru
        onSensorChange(newValue);
    };

    return (
        <Autocomplete
            multiple
            options={options}
            disableCloseOnSelect
            getOptionLabel={(option) => option.visibleName}
            value={selectedSensors}
            onChange={handleChange}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderOption={(props, option, {selected}) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{marginRight: 8}}
                        checked={selected}
                    />
                    {option.visibleName}
                </li>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        {...getTagProps({index})}
                        key={option.sensor_id}
                        label={option.visibleName}
                        size="small"
                        variant="outlined"
                    />
                ))
            }
            renderInput={(params) => (
                <TextField {...params} label="Wybierz czujniki" placeholder="Wyszukaj..."/>
            )}
            sx={{mt: 2}}
        />
    );
};

const RulesTab = ({rules, devices, sensors}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSensors, setSelectedSensors] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [filteredSensors, setFilteredSensors] = useState(sensors);

    const [newRule, setNewRule] = useState({
        name: '',
        locations: [],
        rooms: [],
        floors: [],
        sensors: sensors,
        devices: devices,
        start_date: new Date().toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        end_date: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        value_low: '',
        value_high: '',
        isRecurrent: false,
        actionType: 'LIMIT',
        recurrentTime: ''
    });

    console.log(newRule.start_date)
    const recurrencyTypes = [
        {value: '1', label: 'godzinowo'},
        {value: '2', label: 'dziennie'},
        {value: '3', label: 'tygodniowo'},
        {value: '4', label: 'miesięcznie'},
        {value: '5', label: 'rocznie'}
    ];
    const token = localStorage.getItem("access");

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewRule(prev => ({...prev, [name]: value}));

        // # ("LIGHT", "światło"),
        // # ("HUMIDITY", "wilgotność"),
        // # ("ENERGY", "zużycie energii"),
        // # ("TEMPERATURE", "temperatura"),
        // # ("CONTINUOUS", "ciągłe"),
        // # ("DISCRETE", "dyskretne"),
        // # ("WORKER", "sterowanie"),

        if (name === "actionType") {
            let temp;
            if (value === "SET") {
                temp = sensors.filter((f) => f.data_type === "WORKER" || f.data_type === "TEMPERATURE" ||
                    f.data_type === "LIGHT")
            } else if (value === "LIMIT") {
                temp = sensors.filter((f) => f.data_type === "HUMIDITY" || f.data_type === "ENERGY" ||
                    f.data_type === "TEMPERATURE" || f.data_type === "CONTINUOUS" || f.data_type === "DISCRETE")
            }
            setFilteredSensors(temp)
        }
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setNewRule(prev => ({...prev, [name]: checked}));
    };

    const handleArrayChange = (name, value) => {
        setNewRule(prev => ({
            ...prev,
            [name]: typeof value === 'string' ? value.split(',') : value
        }));
    };

    const handleSubmit = async () => {
        await client.post(API_BASE_URL + `newRule/`,
            {
                newRule: newRule,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('New rule:', newRule);
        setOpenDialog(false);
        // Reset formularza
        setNewRule({
            name: '',
            locations: [],
            rooms: [],
            floors: [],
            sensors: [],
            devices: [],
            start_date: new Date().toISOString().slice(0, 16),
            end_date: '',
            value_low: '',
            value_high: '',
            isRecurrent: false,
            recurrentTime: ''
        });
    };

    const handleSelectAll = () => {
        setFilteredSensors
    };

    const handleDateChange = (name, date) => {
        setNewRule(prev => ({...prev, [name]: date}));
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            <Grid container spacing={3}>
                {rules.length > 0 ? (
                    rules.map((rule) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={rule.id}>
                            <CardContent sx={{flexGrow: 1}}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {rule.name}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    <strong>Zakres
                                        wartości:</strong> {rule.value_low || '–'} - {rule.value_high || '–'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Okres:</strong> {new Date(rule.start_date).toLocaleString()}
                                    {rule.end_date && ` - ${new Date(rule.end_date).toLocaleString()}`}
                                </Typography>
                                {rule.isRecurrent && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Częstotliwość:</strong> {recurrencyTypes.find(t => t.value === rule.recurrentTime)?.label}
                                    </Typography>
                                )}
                                <Box sx={{mt: 1}}>
                                    {rule.locations.length > 0 && (
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5}}>
                                            {rule.locations.map(loc => (
                                                <Chip key={loc.id} label={loc.name} size="small"/>
                                            ))}
                                        </Box>
                                    )}
                                    {rule.rooms.length > 0 && (
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5}}>
                                            {rule.rooms.map(room => (
                                                <Chip key={room.id} label={room.name} size="small" color="primary"/>
                                            ))}
                                        </Box>
                                    )}
                                    {rule.floors.length > 0 && (
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5}}>
                                            {rule.floors.map(floor => (
                                                <Chip key={floor.id} label={floor.name} size="small"
                                                      color="secondary"/>
                                            ))}
                                        </Box>
                                    )}
                                    {rule.sensors.length > 0 && (
                                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                            {rule.sensors.map(sensor => (
                                                <Chip key={sensor.sensor_id} label={sensor.name} size="small"
                                                      variant="outlined"/>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Grid>
                    ))
                ) : (
                    <Grid size={{xs: 12}}>
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
                    </Grid>
                )}
            </Grid>

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
                                    <MenuItem value="LIMIT">Ogranicz</MenuItem>
                                    <MenuItem value="SET">Ustaw</MenuItem>
                                    <MenuItem value="ON/OFF">Włącz/wyłącz</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{xs: 11}}>
                            {newRule.actionType === "ON/OFF" ?
                                <Autocomplete
                                    // multiple
                                    limitTags={2}
                                    id="sensors-multi-select"
                                    options={[devices]}
                                    getOptionLabel={(option) => option.name}
                                    defaultValue={[]}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Wybierz urzązenie" placeholder="Wyszukaj..."/>
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
                                        if (newValue.find(opt => opt.sensor_id === "all")) {
                                            // Jeśli wybrano "Wszystkie" - zaznacz wszystkie sensory
                                            setSelectedDevices([{
                                                sensor_id: "all",
                                                visibleName: "Wszystkie"
                                            }, ...sensors]);
                                        } else {
                                            setSelectedDevices(newValue);
                                        }
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
                                        if (newValue.some(opt => opt.sensor_id === "all")) {
                                            setSelectedSensors(filteredSensors);
                                        } else {
                                            setSelectedSensors(newValue);
                                        }
                                    }}
                                />}
                        </Grid>

                        <Grid size={{xs: 1}} sx={{alignContent: "center"}}>
                            <Tooltip title="Wybierz wszystkie" arrow>
                                <IconButton onClick={() => setSelectedSensors(filteredSensors)}>
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