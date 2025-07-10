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
    Avatar,
    Divider,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Tabs,
    Tab,
    Badge,
    IconButton,
    Tooltip,
    styled
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterAlt as FilterIcon,
    Refresh as RefreshIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Notifications as NotificationsIcon,
    CalendarToday as CalendarIcon,
    Download as DownloadIcon, SettingsSuggest, BackHand
} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import AlarmStatistics from "./alarmStats";

const SeverityIcon = ({type}) => {
    const iconProps = {
        fontSize: "large",
        sx: {mr: 1}
    };

    switch (type) {
        case "1":
            return <ErrorIcon color="error" {...iconProps} />;
        case "2":
            return <WarningIcon color="warning" {...iconProps} />;
        default:
            return <NotificationsIcon color="info" {...iconProps} />;
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
        severity: ""
    });
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        errors: 0,
        warnings: 0,
        today: 0
    });
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);

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

                // Calculate statistics
                const errorCount = response.data.filter(
                    log => log.status === "1"
                ).length;
                const warningCount = response.data.filter(
                    log => log.status === "2"
                ).length;
                const infoCount = response.data.filter(
                    log => log.status === "3"
                ).length;

                setStats({
                    total: response.data.length,
                    errors: errorCount,
                    warnings: warningCount,
                    info: infoCount,
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

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            filters.search === "" ||
            log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.device.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type === "" || log.type === filters.type;
        const matchesSeverity =
            filters.severity === "" || log.severity === filters.severity;
        const matchesDate =
            filters.dateRange === "" ||
            new Date(log.created_at).toDateString() ===
            new Date(filters.dateRange).toDateString();

        return matchesSearch && matchesType && matchesSeverity && matchesDate;
    });

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

    const handleExport = async () => {
        try {
            const response = await client.post(API_BASE_URL + "actions/",{
                actionType: "export",
                currentData: filteredLogs,
            },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setLogs(response.data);

        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Typography variant="h4" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Historia zdarzeń systemowych
            </Typography>


            {/* Summary Cards */}
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid item xs={12} md={3}>
                    <Card elevation={2} sx={{height: "100%"}}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: "primary.light",
                                        color: "primary.main",
                                        mr: 2
                                    }}
                                >
                                    <NotificationsIcon/>
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Wszystkie
                                    </Typography>
                                    <Typography variant="h4">{stats.total}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2} sx={{height: "100%"}}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: "error.light",
                                        color: "error.main",
                                        mr: 2
                                    }}
                                >
                                    <ErrorIcon/>
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Krytyczne
                                    </Typography>
                                    <Typography variant="h4">{stats.errors}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2} sx={{height: "100%"}}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: "warning.light",
                                        color: "warning.main",
                                        mr: 2
                                    }}
                                >
                                    <WarningIcon/>
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Ostrzeżenia
                                    </Typography>
                                    <Typography variant="h4">{stats.warnings}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2} sx={{height: "100%"}}>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: "info.light",
                                        color: "info.main",
                                        mr: 2
                                    }}
                                >
                                    <CalendarIcon/>
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Informacje
                                    </Typography>
                                    <Typography variant="h4">{stats.info}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <AlarmStatistics stats={stats}/>


            {/* Filters and Controls */}
            <Paper elevation={2} sx={{p: 3, mb: 3, borderRadius: 2}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search events..."
                            value={filters.search}
                            onChange={e => setFilters({...filters, search: e.target.value})}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{color: "action.active", mr: 1}}/>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Select
                            fullWidth
                            value={filters.type}
                            onChange={e => setFilters({...filters, type: e.target.value})}
                            displayEmpty
                            inputProps={{"aria-label": "Event type"}}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="MANUAL">Manual</MenuItem>
                            <MenuItem value="AUTO">Automatic</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Select
                            fullWidth
                            value={filters.severity}
                            onChange={e => setFilters({...filters, severity: e.target.value})}
                            displayEmpty
                            inputProps={{"aria-label": "Severity"}}
                        >
                            <MenuItem value="">Status</MenuItem>
                            <MenuItem value="1">Błąd krytyczny</MenuItem>
                            <MenuItem value="2">Ostrzeżenie</MenuItem>
                            <MenuItem value="3">Informacja</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            type="date"
                            variant="outlined"
                            InputLabelProps={{shrink: true}}
                            value={filters.dateRange}
                            onChange={e => setFilters({...filters, dateRange: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={12} md={1}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<FilterIcon/>}
                            onClick={() => setFilters({search: "", type: "", dateRange: "", severity: ""})}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{mb: 2}}
                >

                    <Box>
                        <Tooltip title="Odśwież">
                            <IconButton onClick={handleRefresh} sx={{mr: 1}}>
                                <RefreshIcon/>
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon/>}
                            onClick={handleExport}
                            sx={{mr: 2}}
                        >
                            Eksportuj
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Events Table */}
            <Paper elevation={2} sx={{borderRadius: 2, overflow: "hidden"}}>
                {loading && <LinearProgress/>}
                <TableContainer>
                    <Table>
                        <TableHead sx={{bgcolor: "background.default"}}>
                            <TableRow>
                                <TableCell width="150px">Czas zdarzenia</TableCell>
                                <TableCell width="60px">Status</TableCell>
                                <TableCell>Nazwa</TableCell>
                                <TableCell width="60px">Typ</TableCell>
                                <TableCell width="200px">Urządzenie</TableCell>
                                <TableCell width="100px">Wartość</TableCell>
                                <TableCell width="200px">Lokacja</TableCell>
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
                                            sx={{
                                                "&:last-child td, &:last-child th": {border: 0},
                                                bgcolor:
                                                    log.status === "1"
                                                        ? "error.light"
                                                        : log.status === "2"
                                                            ? "warning.light"
                                                            : "inherit"
                                            }}
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
                                                <Tooltip title={log.type} >
                                                    <Box alignItems="center">
                                                            <TypeIcon type={log.type}/>
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" sx={{fontWeight: 500}}>
                                                    {log.device.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {log.device.brand} #{log.device.serial_number}
                                                </Typography>
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
                                                        ? `${log.measurement.value} ${log.device.unit || ""}`
                                                        : "N/A"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" flexDirection="column" gap={0.5}>
                                                    <Chip
                                                        label={log.device.room.home.name}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={log.device.room.name}
                                                        size="small"
                                                        color="secondary"
                                                        variant="outlined"
                                                    />
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
                    sx={{borderTop: "1px solid", borderColor: "divider"}}
                />
            </Paper>
        </Container>
    );
}

export default History;