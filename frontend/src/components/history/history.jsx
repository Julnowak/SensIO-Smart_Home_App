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
    Tooltip,InputAdornment
} from "@mui/material";
import {
    Search as SearchIcon,
    Warning as WarningIcon, SettingsSuggest, BackHand, Info
} from "@mui/icons-material";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";
import AlarmStatistics from "./alarmStats.jsx";
import {useNavigate} from "react-router-dom";
import {ClearIcon} from "@mui/x-date-pickers";

const SeverityIcon = ({type}) => {


    switch (type) {
        case "HIGH":
            return <WarningIcon color="error" fontSize="large" sx={{mr: 1}} />;
        case "MEDIUM":
            return <WarningIcon color="warning" fontSize="large" sx={{mr: 1}} />;
        case "LOW":
            return <WarningIcon fontSize="large" sx={{mr: 1, color: '#f6c62b'}}/>;
        default:
            return <Info color="info" fontSize="large" sx={{mr: 1}} />;
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
        dateRange: "",
        status: ""
    });
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        errors: 0,
        warnings: 0,
        today: 0,
        lastUpdate: ""
    });
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    const token = localStorage.getItem("access");
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "actions", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setLogs(response.data);
            setFilteredLogs(response.data);

            // Calculate statistics
            const errorCount = response.data.filter(
                log => log.status === "HIGH"
            ).length;
            const mediumCount = response.data.filter(
                log => log.status === "MEDIUM"
            ).length;
            const warningCount = response.data.filter(
                log => log.status === "LOW"
            ).length;
            const infoCount = response.data.filter(
                log => log.status === "NORMAL"
            ).length;

            setStats({
                total: response.data.length,
                errors: errorCount,
                mediums: mediumCount,
                warnings: warningCount,
                info: infoCount,
                lastUpdate: response.data[response.data.length - 1].created_at
            });
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (token && logs.length === 0) {
            fetchData();
        }
    }, [token, fetchData]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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
            const matchesSearch =
                filters.search === "" ||
                log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.device.name.toLowerCase().includes(filters.search.toLowerCase());
            const matchesType = filters.type === "" || log.type === filters.type;
            const matchesSeverity =
                filters.status === "" || log.status === filters.status;
            const matchesDate =
                filters.dateRange === "" ||
                new Date(log.created_at).toDateString() ===
                new Date(filters.dateRange).toDateString();

            return matchesSearch && matchesType && matchesSeverity && matchesDate;
        }))
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

            // Tworzenie linku do pobrania pliku
            const url = window.URL.createObjectURL(new Blob([response.data]));
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


    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <AlarmStatistics stats={stats} actions={logs}/>


            <Paper elevation={2} sx={{p: 3, mb: 3, borderRadius: 2}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Wyszukaj akcje..."
                            value={filters.search}
                            onChange={e => setFilters({...filters, search: e.target.value})}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action"/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Typ akcji */}
                    <Grid item xs={12} sm={4} md={2}>
                        <Select
                            fullWidth
                            size="small"
                            value={filters.type}
                            onChange={e => setFilters({...filters, type: e.target.value})}
                            displayEmpty
                        >
                            <MenuItem value="">Wszystkie typy</MenuItem>
                            <MenuItem value="AUTO">Automatyczne</MenuItem>
                            <MenuItem value="MANUAL">Ręczne</MenuItem>
                        </Select>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} sm={4} md={2}>
                        <Select
                            fullWidth
                            size="small"
                            value={filters.status}
                            onChange={e => setFilters({...filters, status: e.target.value})}
                            displayEmpty
                        >
                            <MenuItem value="">Wszystkie statusy</MenuItem>
                            <MenuItem value="LOW">Niski</MenuItem>
                            <MenuItem value="MEDIUM">Średni</MenuItem>
                            <MenuItem value="HIGH">Wysoki</MenuItem>
                        </Select>
                    </Grid>

                    {/* Data */}
                    <Grid item xs={12} sm={4} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            variant="outlined"
                            label="Data"
                            InputLabelProps={{shrink: true}}
                            value={filters.date}
                            onChange={e => setFilters({...filters, date: e.target.value})}
                        />
                    </Grid>

                    {/* Przyciski akcji */}
                    <Grid item xs={12} sm={6} md={2} sx={{display: 'flex', gap: 1}}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            startIcon={<ClearIcon/>}
                            onClick={() => {
                                setFilters({search: "", type: "", status: "", date: ""});
                                setFilteredLogs(logs);
                            }}
                        >
                            Wyczyść
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<SearchIcon/>}
                            onClick={handleFilter}
                        >
                            Filtruj
                        </Button>
                    </Grid>
                </Grid>
            </Paper>


            <Paper elevation={2} sx={{borderRadius: 2, border: "1px solid #00000020", overflow: "hidden"}}>
                {loading && <LinearProgress/>}
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
                                            key={log.id}
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