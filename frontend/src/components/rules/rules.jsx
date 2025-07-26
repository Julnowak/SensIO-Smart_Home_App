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
    TablePagination, List, ListItem
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
    InfoOutline, ExpandMore
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
    const [rule, setRule] = useState(null);
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

    // const handleInputChange = (e) => {
    //     const {name, value} = e.target;
    //     setCurrentRule(prev => ({...prev, [name]: value}));
    // };
    //
    // const handleCheckboxChange = (e) => {
    //     const {name, checked} = e.target;
    //     setCurrentRule(prev => ({...prev, [name]: checked}));
    // };
    //
    // const handleDateChange = (name, value) => {
    //     setCurrentRule(prev => ({...prev, [name]: value}));
    // };

      const [editedRule, setEditedRule] = useState({
    name: '',
    type: 'LIMIT',
    locations: [],
    rooms: [],
    floors: [],
    devices: [],
    sensors: [],
    start_date: new Date(),
    end_date: null,
    value_low: '',
    value_high: '',
    isRecurrent: false,
    isActive: true,
    recurrentTime: ''
  });

  const RECURRENCY_TYPES = [
    { value: "1", label: "godzinowo" },
    { value: "2", label: "dziennie" },
    { value: "3", label: "tygodniowo" },
    { value: "4", label: "miesięcznie" },
    { value: "5", label: "rocznie" }
  ];

  const DATA_TYPES = [
    { value: "ON/OFF", label: "włącz/wyłącz" },
    { value: "LIMIT", label: "limity" },
    { value: "SET", label: "ustawienie" }
  ];

  // Initialize form with rule data
  useEffect(() => {
    if (rule) {
      setEditedRule({
        name: rule.name || '',
        type: rule.type || 'LIMIT',
        locations: rule.locations.all() || [],
        rooms: rule.rooms.all() || [],
        floors: rule.floors.all() || [],
        devices: rule.devices.all() || [],
        sensors: rule.sensors.all() || [],
        start_date: new Date(rule.start_date) || new Date(),
        end_date: rule.end_date ? new Date(rule.end_date) : null,
        value_low: rule.value_low || '',
        value_high: rule.value_high || '',
        isRecurrent: rule.isRecurrent || false,
        isActive: rule.isActive !== false,
        recurrentTime: rule.recurrentTime || ''
      });
    } else {
      // Reset to defaults for new rule
      setEditedRule({
        name: '',
        type: 'LIMIT',
        locations: [],
        rooms: [],
        floors: [],
        devices: [],
        sensors: [],
        start_date: new Date(),
        end_date: null,
        value_low: '',
        value_high: '',
        isRecurrent: false,
        isActive: true,
        recurrentTime: ''
      });
    }
  }, [rule]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedRule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name, date) => {
    setEditedRule(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleMultiSelectChange = (name, newValue) => {
    setEditedRule(prev => ({
      ...prev,
      [name]: newValue
    }));
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

    const onClose = () => {

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
                                                                            {rule.start_date? new Date(rule.start_date).toLocaleString(): "---"}
                                                                        </Typography>

                                                                        {rule.type === "LIMIT" && rule.end_date && (
                                                                            <Typography variant="body2">
                                                                                {rule.type === "LIMIT" && "Do: "}
                                                                                {rule.end_date?new Date(rule.end_date).toLocaleString(): "---"}
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
          {rule ? `Edytuj regułę ${rule.id}` : 'Dodaj nową regułę'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Nazwa reguły"
              name="name"
              value={editedRule.name}
              onChange={handleChange}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Typ reguły</InputLabel>
              <Select
                name="type"
                value={editedRule.type}
                onChange={handleChange}
                label="Typ reguły"
                required
              >
                {DATA_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">Obiekty:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/*<Autocomplete*/}
              {/*  multiple*/}
              {/*  options={homes}*/}
              {/*  getOptionLabel={(option) => option.name}*/}
              {/*  value={editedRule.locations}*/}
              {/*  onChange={(e, newValue) => handleMultiSelectChange('locations', newValue)}*/}
              {/*  renderInput={(params) => (*/}
              {/*    <TextField {...params} label="Lokalizacje" placeholder="Wybierz lokalizacje" />*/}
              {/*  )}*/}
              {/*  sx={{ minWidth: 200, flexGrow: 1 }}*/}
              {/*/>*/}

              {/*<Autocomplete*/}
              {/*  multiple*/}
              {/*  options={rooms}*/}
              {/*  getOptionLabel={(option) => option.name}*/}
              {/*  value={editedRule.rooms}*/}
              {/*  onChange={(e, newValue) => handleMultiSelectChange('rooms', newValue)}*/}
              {/*  renderInput={(params) => (*/}
              {/*    <TextField {...params} label="Pokoje" placeholder="Wybierz pokoje" />*/}
              {/*  )}*/}
              {/*  sx={{ minWidth: 200, flexGrow: 1 }}*/}
              {/*/>*/}

              {/*<Autocomplete*/}
              {/*  multiple*/}
              {/*  options={floors}*/}
              {/*  getOptionLabel={(option) => option.name}*/}
              {/*  value={editedRule.floors}*/}
              {/*  onChange={(e, newValue) => handleMultiSelectChange('floors', newValue)}*/}
              {/*  renderInput={(params) => (*/}
              {/*    <TextField {...params} label="Piętra" placeholder="Wybierz piętra" />*/}
              {/*  )}*/}
              {/*  sx={{ minWidth: 200, flexGrow: 1 }}*/}
              {/*/>*/}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/*<Autocomplete*/}
              {/*  multiple*/}
              {/*  options={devices}*/}
              {/*  getOptionLabel={(option) => option.name}*/}
              {/*  value={editedRule.devices}*/}
              {/*  onChange={(e, newValue) => handleMultiSelectChange('devices', newValue)}*/}
              {/*  renderInput={(params) => (*/}
              {/*    <TextField {...params} label="Urządzenia" placeholder="Wybierz urządzenia" />*/}
              {/*  )}*/}
              {/*  sx={{ minWidth: 200, flexGrow: 1 }}*/}
              {/*/>*/}

              {/*<Autocomplete*/}
              {/*  multiple*/}
              {/*  options={sensors}*/}
              {/*  getOptionLabel={(option) => option.name}*/}
              {/*  value={editedRule.sensors}*/}
              {/*  onChange={(e, newValue) => handleMultiSelectChange('sensors', newValue)}*/}
              {/*  renderInput={(params) => (*/}
              {/*    <TextField {...params} label="Czujniki" placeholder="Wybierz czujniki" />*/}
              {/*  )}*/}
              {/*  sx={{ minWidth: 200, flexGrow: 1 }}*/}
              {/*/>*/}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">Okres obowiązywania:</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateTimePicker
                label="Data rozpoczęcia"
                value={editedRule.start_date}
                onChange={(date) => handleDateChange('start_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <DateTimePicker
                label="Data zakończenia (opcjonalnie)"
                value={editedRule.end_date}
                onChange={(date) => handleDateChange('end_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">Wartości:</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={editedRule.type === 'SET' ? 'Wartość' : 'Wartość minimalna'}
                name="value_low"
                value={editedRule.value_low}
                onChange={handleChange}
                required={editedRule.type !== 'ON/OFF'}
              />

              {editedRule.type === 'LIMIT' && (
                <TextField
                  fullWidth
                  label="Wartość maksymalna"
                  name="value_high"
                  value={editedRule.value_high}
                  onChange={handleChange}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isRecurrent"
                    checked={editedRule.isRecurrent}
                    onChange={handleChange}
                  />
                }
                label="Reguła cykliczna"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={editedRule.isActive}
                    onChange={handleChange}
                  />
                }
                label="Reguła aktywna"
              />
            </Box>

            {editedRule.isRecurrent && (
              <FormControl fullWidth>
                <InputLabel>Częstotliwość</InputLabel>
                <Select
                  name="recurrentTime"
                  value={editedRule.recurrentTime}
                  onChange={handleChange}
                  label="Częstotliwość"
                  required={editedRule.isRecurrent}
                >
                  {RECURRENCY_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Zapisz regułę
          </Button>
        </DialogActions>
                </Dialog>
            </Container>
        </LocalizationProvider>
    );
};

export default Rules;