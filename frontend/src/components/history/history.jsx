import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    Typography,
    TablePagination,
    Chip,
    Grid,
    LinearProgress,
    Tooltip, IconButton, Stack, Autocomplete
} from "@mui/material";
import {
    Search as SearchIcon,
    Warning as WarningIcon,
    SettingsSuggest,
    BackHand,
    Info,
    RemoveCircleOutline,
    CheckBox,
    CheckBoxOutlineBlank,
    Dangerous, Download, Refresh, Refresh as RefreshIcon, LocationOn
} from "@mui/icons-material";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import AlarmStatistics from "./alarmStats.jsx";
import {useNavigate} from "react-router-dom";
import {ClearIcon} from "@mui/x-date-pickers";
import {useTheme} from "@mui/material/styles";

const SeverityIcon = ({type}) => {


    switch (type) {
        case "HIGH":
            return <WarningIcon color="error" fontSize="large" sx={{mr: 1}}/>;
        case "MEDIUM":
            return <WarningIcon color="warning" fontSize="large" sx={{mr: 1}}/>;
        case "LOW":
            return <WarningIcon fontSize="large" sx={{mr: 1, color: '#f6c62b'}}/>;
        default:
            return <Info color="info" fontSize="large" sx={{mr: 1}}/>;
    }
};


const TypeIcon = ({type}) => {
    const iconProps = {
        fontSize: "large",
        sx: {mr: 1}
    };

    switch (type) {
        case "AUTO":
            return <SettingsSuggest color="black" {...iconProps} />;
        default:
            return <BackHand color="black" {...iconProps} />;
    }
};

function History() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        search: "",
        type: "",
        startDate: "",
        endDate: "",
        status: "",
        isAcknowledged: ""
    });
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        errors: 0,
        warnings: 0,
        today: 0,
        lastUpdate: ""
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    const theme = useTheme();

    const token = localStorage.getItem("access");
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "actions", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setLogs(response.data.actionsData);
            setFilteredLogs(response.data.actionsData);
            setLocations(response.data.locationsData);
            setSelectedLocation(response.data.locationsData.filter((l) => l.current === true)[0]);

            // Calculate statistics
            const errorCount = response.data.actionsData.filter(
                log => log.status === "HIGH"
            ).length;
            const mediumCount = response.data.actionsData.filter(
                log => log.status === "MEDIUM"
            ).length;
            const warningCount = response.data.actionsData.filter(
                log => log.status === "LOW"
            ).length;
            const infoCount = response.data.actionsData.filter(
                log => log.status === "NORMAL"
            ).length;

            setStats({
                total: response.data.actionsData.length,
                errors: errorCount,
                mediums: mediumCount,
                warnings: warningCount,
                info: infoCount,
                lastUpdate: response.data.actionsData[0].created_at
            });
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };


    const handleChangeLoc = async (nv) => {
        setLoading(true)
        setSelectedLocation(nv);
        try {
            const response = await client.get(API_BASE_URL + "actions", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    sel: nv?.home_id
                }
            });
            setLogs(response.data.actionsData);
            setFilteredLogs(response.data.actionsData);

            const errorCount = response.data.actionsData.filter(
                log => log.status === "HIGH"
            ).length;
            const mediumCount = response.data.actionsData.filter(
                log => log.status === "MEDIUM"
            ).length;
            const warningCount = response.data.actionsData.filter(
                log => log.status === "LOW"
            ).length;
            const infoCount = response.data.actionsData.filter(
                log => log.status === "NORMAL"
            ).length;

            setStats({
                total: response.data.actionsData.length,
                errors: errorCount,
                mediums: mediumCount,
                warnings: warningCount,
                info: infoCount,
                lastUpdate: response.data.actionsData[0].created_at
            });
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRefresh = () => {
        fetchData();
    };


    const handleFilter = () => {
        setFilteredLogs(logs.filter(log => {
            const matchesType = filters.type === "" || log.type === filters.type;
            const matchesSeverity = filters.status === "" || log.status === filters.status;
            const matchesAcknowledgement = filters.isAcknowledged === "" || (log.isAcknowledged === filters.isAcknowledged && log.status !== "NORMAL");

            const logDate = new Date(log.created_at).setHours(0, 0, 0, 0);
            const start = filters.startDate ? new Date(filters.startDate).setHours(0, 0, 0, 0) : null;
            const end = filters.endDate ? new Date(filters.endDate).setHours(0, 0, 0, 0) : null;

            const matchesDate =
                (!start && !end) ||
                (start && !end && logDate >= start) ||
                (!start && end && logDate <= end) ||
                (start && end && logDate >= start && logDate <= end);

            return matchesType && matchesSeverity && matchesDate && matchesAcknowledgement;
        }));
    };


    const handleExport = async () => {
        try {
            const response = await client.post(
                API_BASE_URL + "actions/",
                {
                    actionType: "export",
                    ids: filteredLogs.map(log => log.action_id),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                }
            );

            // Dodanie BOM do danych CSV
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const csvBlob = new Blob([bom, response.data], {type: 'text/csv;charset=utf-8;'});

            const url = window.URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'actions_export.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleDanger = async (alarmID) => {
        await client.put(API_BASE_URL + `action/${alarmID}/`,
            {
                isDanger: true,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setFilteredLogs((prev) => prev.map((a) => a.action_id === alarmID ? {
            ...a,
            status: a.status === "HIGH" ? "NORMAL" : "HIGH"
        } : a));
    };


    const handleAcknowledge = async (alarmID) => {
        await client.put(API_BASE_URL + `action/${alarmID}/`,
            {
                isAcknowledged: true,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setFilteredLogs((prev) => prev.map((a) => a.action_id === alarmID ? {
            ...a,
            isAcknowledged: !a.isAcknowledged
        } : a));
    };


    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Tooltip title={"Odśwież"}>
                    <Typography variant="h4" sx={{fontWeight: 600}}>
                        Historia zdarzeń i alarmów
                    </Typography>
                </Tooltip>


                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title={"Odśwież"}>
                        <IconButton onClick={handleRefresh} color="primary" aria-label="Odśwież">
                            <RefreshIcon/>
                        </IconButton>
                    </Tooltip>
                    <Autocomplete
                        options={locations}
                        getOptionLabel={(option) => option.name}
                        value={selectedLocation}
                        onChange={(e, newValue) => {
                            handleChangeLoc(newValue)
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Lokalizacja"
                                variant="outlined"
                                sx={{minWidth: 250}}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <LocationOn color="action" sx={{mr: 1}}/>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />

                </Stack>
            </Box>
            {loading ? <LinearProgress/> : <AlarmStatistics stats={stats} actions={logs}/>}


            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography variant="h6" fontWeight="600">
                        Filtrowanie alarmów
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        order: {xs: 3, sm: 2}, // Na małych ekranach przyciski przejdą pod spód
                        width: {xs: '100%', sm: 'auto'}, // Na małych ekranach pełna szerokość
                        justifyContent: {xs: 'flex-end', sm: 'flex-start'}
                    }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Download/>}
                            onClick={handleExport}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                px: 2,
                                textTransform: 'none',
                                minWidth: 'fit-content'
                            }}
                        >
                            Eksportuj
                        </Button>
                        <Tooltip title="Odśwież">
                            <IconButton
                                onClick={handleRefresh}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.action.hover,
                                    width: 40,
                                    height: 40
                                }}
                            >
                                <Refresh/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{xs: 6, sm: 4}}>
                        <Select
                            fullWidth
                            size="small"
                            value={filters.type}
                            onChange={e => setFilters({...filters, type: e.target.value})}
                            displayEmpty
                            inputProps={{'aria-label': 'Typ akcji'}}
                            sx={{
                                backgroundColor: theme.palette.background.default,
                                borderRadius: 2
                            }}
                        >
                            <MenuItem value="">
                                <em>Wszystkie typy</em>
                            </MenuItem>
                            <MenuItem value="AUTO">Automatyczne</MenuItem>
                            <MenuItem value="MANUAL">Ręczne</MenuItem>
                        </Select>
                    </Grid>

                    {/* Status */}
                    <Grid size={{xs: 6, sm: 4}}>
                        <Select
                            fullWidth
                            size="small"
                            value={filters.status}
                            onChange={e => setFilters({...filters, status: e.target.value})}
                            displayEmpty
                            inputProps={{'aria-label': 'Status'}}
                            sx={{
                                backgroundColor: theme.palette.background.default,
                                borderRadius: 2
                            }}
                        >
                            <MenuItem value="">
                                <em>Wszystkie statusy</em>
                            </MenuItem>
                            <MenuItem value="LOW">Niski</MenuItem>
                            <MenuItem value="MEDIUM">Średni</MenuItem>
                            <MenuItem value="HIGH">Wysoki</MenuItem>
                            <MenuItem value="NORMAL">Brak</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={{xs: 12, sm: 4}}>
                        <Select
                            fullWidth
                            size="small"
                            displayEmpty
                            inputProps={{'aria-label': 'Status'}}
                            sx={{
                                backgroundColor: theme.palette.background.default,
                                borderRadius: 2
                            }}
                            value={filters.isAcknowledged}
                            onChange={e => setFilters({...filters, isAcknowledged: e.target.value})}
                        >
                            <MenuItem value=""><em>Wszystkie oznaczenia</em></MenuItem>
                            <MenuItem value={false}>Nieoznaczone</MenuItem>
                            <MenuItem value={true}>Oznaczone</MenuItem>
                        </Select>
                    </Grid>

                    {/* Zakres dat */}
                    <Grid size={{xs: 6, sm: 4}}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            variant="outlined"
                            label="Od daty"
                            InputLabelProps={{
                                shrink: true,
                                sx: {color: theme.palette.text.primary}
                            }}
                            InputProps={{
                                sx: {
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: 2
                                }
                            }}
                            value={filters.startDate || ''}
                            onChange={e => setFilters({...filters, startDate: e.target.value})}
                        />
                    </Grid>

                    <Grid size={{xs: 6, sm: 4}}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            variant="outlined"
                            label="Do daty"
                            InputLabelProps={{
                                shrink: true,
                                sx: {color: theme.palette.text.primary}
                            }}
                            InputProps={{
                                sx: {
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: 2
                                }
                            }}
                            value={filters.endDate || ''}
                            onChange={e => setFilters({...filters, endDate: e.target.value})}
                        />
                    </Grid>

                    {/* Przyciski akcji */}
                    <Grid size={{xs: 6, sm: 4}} sx={{display: 'flex', gap: 1}}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<SearchIcon/>}
                            onClick={handleFilter}
                            sx={{
                                whiteSpace: 'nowrap',
                                borderRadius: 2,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Filtruj
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<ClearIcon/>}
                            onClick={() => {
                                setFilters({
                                    search: "",
                                    type: "",
                                    status: "",
                                    startDate: "",
                                    endDate: ""
                                });
                                setFilteredLogs(logs);
                            }}
                            sx={{
                                borderRadius: 2,
                                py: 1,
                                textTransform: 'none'
                            }}
                        >
                            Wyczyść
                        </Button>
                    </Grid>
                </Grid>

            </Paper>


            <Paper elevation={2} sx={{borderRadius: 2, border: "1px solid #00000020", overflow: "hidden"}}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{bgcolor: "background.default"}}>
                            <TableRow>
                                <TableCell width="130px">Czas zdarzenia</TableCell>
                                <TableCell width="60px">Status</TableCell>
                                <TableCell>Nazwa</TableCell>
                                <TableCell width="60px">Typ</TableCell>
                                <TableCell width="200px">Urządzenie</TableCell>
                                <TableCell>Wartość</TableCell>
                                <TableCell>Lokacja</TableCell>
                                <TableCell>Akcja</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(log => (
                                        <TableRow
                                            key={log.action_id}
                                            hover
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{fontWeight: 500}}>
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <SeverityIcon type={log.status}/>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body1" sx={{fontWeight: 500}}>
                                                        {log.description}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={log.type}>
                                                    <Box alignItems="center">
                                                        <TypeIcon type={log.type}/>
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip sx={{m: 0.2}} size={"small"}
                                                      onClick={() => navigate(`/sensor/${log.measurement.sensor.sensor_id}`)}
                                                      variant={"outlined"} label={log.measurement.sensor.visibleName}/>
                                                <Chip sx={{m: 0.2}} size={"small"}
                                                      onClick={() => navigate(`/device/${log.device.device_id}`)}
                                                      variant={"outlined"} label={log.device.name}/>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body1"
                                                    color={
                                                        log.measurement?.value > log.device.max_value
                                                            ? "error.main"
                                                            : log.measurement?.value < log.device.min_value
                                                                ? "warning.main"
                                                                : "text.primary"
                                                    }
                                                    sx={{fontWeight: 600}}
                                                >
                                                    {log.measurement?.value
                                                        ? `${parseFloat(log?.measurement?.value)} ${log.measurement.sensor.unit || ""}`
                                                        : "N/A"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" flexDirection="column" gap={0.5}>
                                                    <Chip
                                                        onClick={() => navigate(`/home/${log?.device?.location.home_id}`)}
                                                        label={log?.device?.location?.name}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                    {log?.device?.room && (
                                                        <Chip
                                                            onClick={() => navigate(`/room/${log?.device?.room.room_id}`)}
                                                            label={log?.device?.room?.name}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    {log?.device?.floor && (
                                                        <Chip
                                                            label={`Piętro ${log?.device?.floor?.floor_number}`}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                        />
                                                    )}

                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{padding: '4px', width: '80px'}}>
                                                {log.status !== "NORMAL" ? (
                                                        <Box sx={{display: 'flex'}}>
                                                            <Tooltip title={"Bezpieczne"} arrow>
                                                                <IconButton size="small"
                                                                            onClick={() => handleDanger(log.action_id)}>
                                                                    <RemoveCircleOutline fontSize="small" color="action"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={log.isAcknowledged ? "Odznacz" : "Oznacz"}
                                                                     arrow>
                                                                <IconButton size="small"
                                                                            onClick={() => handleAcknowledge(log.action_id)}>
                                                                    {log.isAcknowledged ?
                                                                        <CheckBox fontSize="small" color="action"/> :
                                                                        <CheckBoxOutlineBlank fontSize="small"
                                                                                              color="action"/>}
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) :
                                                    <Box sx={{display: 'flex', gap: '4px'}}>
                                                        <Tooltip title={"Zagrożenie"} arrow>
                                                            <IconButton size="small"
                                                                        onClick={() => handleDanger(log.action_id)}>
                                                                <Dangerous fontSize="small" color="error"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{py: 4}}>
                                        <Typography variant="body1" color="text.secondary">
                                            Nie znaleziono rezultatów.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredLogs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        // Styles applied directly to the toolbar using its class
                        '& .MuiTablePagination-toolbar': {
                            display: 'flex',      // Make it a flex container
                            alignItems: 'center', // Vertically center all items within this toolbar

                        },
                        '& .MuiTablePagination-selectLabel': {
                            margin: 0,
                            padding: 0,
                        }, '& .MuiTablePagination-displayedRows': {
                            margin: 0,
                            padding: 0,
                        },
                        // Opcjonalne dla samego select'a, jeśli ma dziwny offset
                        '& .MuiTablePagination-select': {
                            // margin: 0,
                            // padding: 0,
                        }

                    }}
                    labelRowsPerPage={"Wyniki na stronę:"}
                    labelDisplayedRows={({from, to, count}) =>
                        `${from}–${to} z ${count !== -1 ? count : `ponad ${to}`}`
                    }
                />
            </Paper>
        </Container>
    );
}

export default History;