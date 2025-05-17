import React, { useEffect, useState } from "react";
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
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import client from "../../client";
import { API_BASE_URL } from "../../config";


const StatusChip = styled(Chip)(({ theme, severity }) => ({
  fontWeight: 600,
  borderRadius: 4,
  backgroundColor:
    severity === "error"
      ? theme.palette.error.light
      : severity === "warning"
      ? theme.palette.warning.light
      : theme.palette.success.light,
  color:
    severity === "error"
      ? theme.palette.error.dark
      : severity === "warning"
      ? theme.palette.warning.dark
      : theme.palette.success.dark
}));

const SeverityIcon = ({ type }) => {
  const iconProps = {
    fontSize: "small",
    sx: { mr: 1 }
  };

  switch (type) {
    case "error":
      return <ErrorIcon color="error" {...iconProps} />;
    case "warning":
      return <WarningIcon color="warning" {...iconProps} />;
    default:
      return <InfoIcon color="info" {...iconProps} />;
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

  useEffect(() => {
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
          log => log.severity === "error"
        ).length;
        const warningCount = response.data.filter(
          log => log.severity === "warning"
        ).length;
        const todayCount = response.data.filter(log => {
          const logDate = new Date(log.created_at);
          const today = new Date();
          return (
            logDate.getDate() === today.getDate() &&
            logDate.getMonth() === today.getMonth() &&
            logDate.getFullYear() === today.getFullYear()
          );
        }).length;

        setStats({
          total: response.data.length,
          errors: errorCount,
          warnings: warningCount,
          today: todayCount
        });
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // You can add additional filtering based on tabs if needed
  };

  const handleRefresh = () => {
    // Implement refresh logic
  };

  const handleExport = () => {
    // Implement export logic
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        System Event History
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.main",
                    mr: 2
                  }}
                >
                  <NotificationsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "error.light",
                    color: "error.main",
                    mr: 2
                  }}
                >
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Critical Errors
                  </Typography>
                  <Typography variant="h4">{stats.errors}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "warning.light",
                    color: "warning.main",
                    mr: 2
                  }}
                >
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Warnings
                  </Typography>
                  <Typography variant="h4">{stats.warnings}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "success.light",
                    color: "success.main",
                    mr: 2
                  }}
                >
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today's Events
                  </Typography>
                  <Typography variant="h4">{stats.today}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="All Events" />
            <Tab
              label={
                <Badge badgeContent={stats.errors} color="error">
                  Errors
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={stats.warnings} color="warning">
                  Warnings
                </Badge>
              }
            />
          </Tabs>

          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ mr: 2 }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Select
              fullWidth
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              displayEmpty
              inputProps={{ "aria-label": "Event type" }}
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
              onChange={e => setFilters({ ...filters, severity: e.target.value })}
              displayEmpty
              inputProps={{ "aria-label": "Severity" }}
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={filters.dateRange}
              onChange={e => setFilters({ ...filters, dateRange: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => setFilters({ search: "", type: "", dateRange: "", severity: "" })}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell width="150px">Timestamp</TableCell>
                <TableCell>Event</TableCell>
                <TableCell width="200px">Device</TableCell>
                <TableCell width="120px">Status</TableCell>
                <TableCell width="100px">Value</TableCell>
                <TableCell width="200px">Location</TableCell>
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
                        "&:last-child td, &:last-child th": { border: 0 },
                        bgcolor:
                          log.severity === "error"
                            ? "error.light"
                            : log.severity === "warning"
                            ? "warning.light"
                            : "inherit"
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(log.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SeverityIcon type={log.severity} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {log.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.type === "MANUAL" ? "Manual action" : "System action"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {log.device.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.device.brand} #{log.device.serial_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={
                            log.severity === "error"
                              ? "Critical"
                              : log.severity === "warning"
                              ? "Warning"
                              : "Normal"
                          }
                          severity={log.severity}
                        />
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
                          sx={{ fontWeight: 600 }}
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No events found matching your criteria
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
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      </Paper>
    </Container>
  );
}

export default History;