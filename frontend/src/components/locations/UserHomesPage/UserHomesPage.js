import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  styled,
  Avatar,
  Chip,
  Breadcrumbs,
  Link,
  Tooltip,
  Badge, TableCell, TableContainer, Table, TableHead, TableRow, TableBody
} from "@mui/material";
import {
  Add,
  CheckCircle,
  Edit,
  Delete,
  LocationOn,
  Search,
  Home,
  Apartment,
  Business,
  Warehouse,
  School,
  HealthAndSafety, ListAlt, ViewComfy
} from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";
// import { DataGrid } from "@mui/x-data-grid";

// Building type icons mapping
const buildingIcons = {
  house: <Home color="black" />,
  apartment: <Apartment color="black" />,
  office: <Business color="black" />,
  warehouse: <Warehouse color="black" />,
  school: <School color="black" />,
  hospital: <HealthAndSafety color="black" />,
  default: <Apartment color="black" />
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.12)"
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: "0.7rem",
  textTransform: "uppercase",
  backgroundColor:
    status === "aktywny"
      ? theme.palette.success.light
      : theme.palette.grey[400],
  color:
    status === "aktywny"
      ? "black"
      : "black"
}));

const UserLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const itemsPerPage = 5;

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await client.get(API_BASE_URL + "myHomes/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Add mock status and devices count for demo purposes
        const locationsWithStatus = response.data.map(loc => ({
          ...loc,
          devicesCount: Math.floor(Math.random() * 15) + 1,
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        }));
        setLocations(locationsWithStatus);
        setFilteredLocations(locationsWithStatus);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    token && fetchLocations();
  }, [token]);

  useEffect(() => {
    let filtered = [...locations];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredLocations(filtered);
    setCurrentPage(1);
  }, [search, locations, sortConfig]);

  const handleSetCurrent = async (homeId) => {
    try {
      await client.put(
        API_BASE_URL + "myHomes/",
        { location_id: homeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = locations.map(loc => ({
        ...loc,
        current: loc.home_id === homeId
      }));
      setLocations(updated);
    } catch (error) {
      console.error("Failed to set current location", error);
    }
  };

  const handleDelete = async (homeId) => {
    if (window.confirm("Are you sure you want to delete this building?")) {
      try {
        await client.delete(`${API_BASE_URL}myHomes/${homeId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLocations(locations.filter(loc => loc.home_id !== homeId));
      } catch (error) {
        console.error("Failed to delete location", error);
      }
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Columns for grid view
  const columns = [
    {
      field: "name",
      headerName: "Building Name",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: "primary.light",
              color: "primary.main",
              width: 40,
              height: 40
            }}
          >
            {buildingIcons[params.row.type?.toLowerCase()] || buildingIcons.default}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.address}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <StatusBadge
          label={params.value}
          status={params.value}
          size="small"
        />
      )
    },
    {
      field: "devicesCount",
      headerName: "Devices",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value} devices`}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: "lastUpdated",
      headerName: "Last Updated",
      width: 180,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/home/${params.row.home_id}/edit`);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.home_id);
              }}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Set as current">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSetCurrent(params.row.home_id);
              }}
              color={params.row.current ? "primary" : "default"}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="text.primary">Zarządzaj</Typography>
          <Typography color="text.primary">Moje lokacje</Typography>
        </Breadcrumbs>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h4" component="h1" fontWeight={700}>
              Lokacje
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant={viewMode === "list" ? "contained" : "outlined"}
                onClick={() => setViewMode("list")}
                size="small"
              >
                <ListAlt/>
              </Button>
              <Button
                variant={viewMode === "grid" ? "contained" : "outlined"}
                onClick={() => setViewMode("grid")}
                size="small"
              >
                <ViewComfy/>
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/addHome"
                sx={{ minWidth: 200 }}
              >
                Nowa lokacja
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <LocationOn color="primary" fontSize="large" />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h6" gutterBottom>
                    Wybrana lokacja:
                  </Typography>
                  <Select
                    fullWidth
                    value={locations.find(loc => loc.current)?.home_id || ""}
                    onChange={(e) => handleSetCurrent(e.target.value)}
                    sx={{ minWidth: 300 }}
                  >
                    {locations.map(location => (
                      <MenuItem key={location.home_id} value={location.home_id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {buildingIcons[location.type?.toLowerCase()] || buildingIcons.default}
                          {location.name} - {location.address}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={2}>
                  <Box textAlign="right">
                    <Typography variant="body2" color="text.secondary">
                      Liczba lokacji
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {locations.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <TextField
                variant="outlined"
                placeholder="Wyszukaj lokację..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />
                }}
                sx={{ width: 400 }}
              />
              <Box display="flex" gap={1}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                  Sortuj po:
                </Typography>
                <Button
                  size="small"
                  endIcon={
                    sortConfig.key === "name" && sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.key === "name" && sortConfig.direction === "desc"
                      ? "↓"
                      : null
                  }
                  onClick={() => handleSort("name")}
                >
                  Nazwa
                </Button>
                <Button
                  size="small"
                  endIcon={
                    sortConfig.key === "lastUpdated" && sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.key === "lastUpdated" && sortConfig.direction === "desc"
                      ? "↓"
                      : null
                  }
                  onClick={() => handleSort("lastUpdated")}
                >
                  Data aktualizacji
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {viewMode === "grid" ? (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ height: 600, width: "100%", borderRadius: 2 }}>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nazwa lokacji</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Urządzenia</TableCell>
                      <TableCell>Ostatnia aktualizacja</TableCell>
                      <TableCell>Akcje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLocations.map((location) => (
                      <TableRow
                        key={location.home_id}
                        hover
                        onClick={() => navigate(`/home/${location.home_id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                bgcolor: 'primary.light',
                                color: 'mainprimary.',
                                width: 40,
                                height: 40,
                              }}
                            >
                              {buildingIcons[location.type?.toLowerCase()] || buildingIcons.default}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {location.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {location.address}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={location.status}
                            status={location.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${location.devicesCount} urządzeń`}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(location.lastUpdated).toLocaleDateString()}, {new Date(location.lastUpdated).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/home/${location.home_id}/edit`);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(location.home_id);
                                }}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {filteredLocations
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((location) => (
                  <Grid item xs={12} key={location.home_id}>
                    <StyledCard
                      onClick={() => navigate(`/home/${location.home_id}`)}
                      sx={{
                        borderLeft: location.current
                          ? "4px solid primary.main"
                          : "4px solid transparent"
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={1}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                bgcolor: "primary.light",

                                width: 48,
                                height: 48
                              }}
                            >
                              {buildingIcons[location.type?.toLowerCase()] || buildingIcons.default}
                            </Avatar>
                          </Grid>
                          <Grid item xs={5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {location.name}
                              </Typography>
                              {location.current && (
                                <Chip
                                  label="Wybrany"
                                  size="small"
                                  color="primary"
                                  icon={<CheckCircle fontSize="small" />}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                            >
                              <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                              {location.address}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} textAlign="center">
                            <StatusBadge
                              label={location.status}
                              status={location.status}
                            />
                          </Grid>
                          <Grid item xs={2} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                              Urządzenia
                            </Typography>
                            <Typography variant="h6">
                              {location.devicesCount}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} textAlign="right">
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/home/${location.home_id}/edit`);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(location.home_id);
                                  }}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Ostatnia aktualizacja: {new Date(location.lastUpdated).toLocaleDateString()}, {new Date(location.lastUpdated).toLocaleTimeString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        )}

        {viewMode === "list" && (
          <Grid item xs={12}>
            <Pagination
              count={Math.ceil(filteredLocations.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              shape="rounded"
              sx={{ display: "flex", justifyContent: "center" }}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default UserLocationsPage;