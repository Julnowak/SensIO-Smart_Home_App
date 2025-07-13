import React, {useState, useEffect} from "react";
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
    Badge, TableCell, TableContainer, Table, TableHead, TableRow, TableBody, useTheme, useMediaQuery
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
    HealthAndSafety, ListAlt, ViewComfy, WifiTethering, WifiTetheringOff
} from "@mui/icons-material";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import {useNavigate} from "react-router-dom";

// Building type icons mapping
const buildingIcons = {
    house: <Home color="black"/>,
    apartment: <Apartment color="black"/>,
    office: <Business color="black"/>,
    warehouse: <Warehouse color="black"/>,
    school: <School color="black"/>,
    hospital: <HealthAndSafety color="black"/>,
    default: <Apartment color="black"/>
};

const UserLocationsPage = () => {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({key: "name", direction: "asc"});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await client.get(API_BASE_URL + "myHomes/", {
                    headers: {Authorization: `Bearer ${token}`}
                });
                // Add mock status and devices count for demo purposes
                const locationsWithStatus = response.data.map(loc => ({
                    ...loc,
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

        if (search) {
            filtered = filtered.filter(location =>
                location.name.toLowerCase().includes(search.toLowerCase()) ||
                location.address.toLowerCase().includes(search.toLowerCase())
            );
        }

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
    }, [search, locations, sortConfig]);

    const handleSetCurrent = async (homeId) => {
        try {
            await client.put(
                API_BASE_URL + "myHomes/",
                {location_id: homeId},
                {headers: {Authorization: `Bearer ${token}`}}
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
        if (window.confirm("Czy na pewno chcesz usunąć budynek?")) {
            try {
                await client.delete(API_BASE_URL + `home/${homeId}/`, {
                    headers: {Authorization: `Bearer ${token}`}
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
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredLocations.length, 1) / perPage);

    const navigate = useNavigate();

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{mb: 2}}
                    >
                        <Typography variant="h4" component="h1" fontWeight={700}>
                            Lokacje
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={<Add/>}
                                href="/addHome"
                                sx={{minWidth: 200}}
                            >
                                Nowa lokacja
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Card variant="outlined" sx={{borderRadius: 2}}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <LocationOn color="primary" fontSize="large"/>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="h6" gutterBottom>
                                        Wybrana lokacja:
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value={locations.find(loc => loc.current)?.home_id || ""}
                                        onChange={(e) => handleSetCurrent(e.target.value)}
                                        sx={{minWidth: 300}}
                                    >
                                        {locations.map(location => (
                                            <MenuItem key={location.home_id} value={location.home_id}>
                                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
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
                    <Paper elevation={0} sx={{p: 2, borderRadius: 2}}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <TextField
                                variant="outlined"
                                placeholder="Wyszukaj lokację..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{color: "action.active", mr: 1}}/>
                                }}
                                sx={{width: 400}}
                            />
                            <Box display="flex" gap={1}>
                                <Typography variant="body2" color="text.secondary" sx={{alignSelf: "center"}}>
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

                <Grid item xs={12}>
                    <Paper elevation={0} sx={{width: "100%", borderRadius: 2, overflow: 'hidden'}}>
                        <TableContainer sx={{maxHeight: 600}}>
                            <Table stickyHeader aria-label="locations table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold', minWidth: 200}}>Nazwa lokacji</TableCell>
                                        {!isMobile && (
                                            <>
                                                <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                                                <TableCell sx={{fontWeight: 'bold'}}>Urządzenia</TableCell>
                                                <TableCell sx={{fontWeight: 'bold', minWidth: 150}}>Ostatnia
                                                    aktualizacja</TableCell>
                                            </>
                                        )}
                                        <TableCell sx={{fontWeight: 'bold'}}>Akcje</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedLocations.map((location) => (
                                        <TableRow
                                            key={location.home_id}
                                            hover
                                            onClick={() => navigate(`/home/${location.home_id}`)}
                                            sx={{cursor: 'pointer', '&:last-child td': {borderBottom: 0}}}
                                        >
                                            <TableCell>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>

                                                    {location.image ?
                                                        <Avatar
                                                            variant="rounded"
                                                            sx={{
                                                                bgcolor: 'primary.light',
                                                                color: 'primary.main',
                                                                width: 40,
                                                                height: 40,
                                                            }}
                                                            src={location.image?.slice(16)}
                                                        /> : <Avatar
                                                            variant="rounded"
                                                            sx={{
                                                                bgcolor: 'primary',
                                                                color: 'primary.contrast',
                                                                width: 40,
                                                                height: 40,
                                                            }}
                                                        >
                                                            {buildingIcons[location.type?.toLowerCase()] || buildingIcons.default}
                                                        </Avatar>}
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {location.name}
                                                        </Typography>
                                                        {!isMobile && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {location.address}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {!isMobile && (
                                                <>
                                                    <TableCell>
                                                        {location.isActive ?
                                                            <Tooltip title={"Aktywny"}>
                                                                <WifiTethering color={"success"} size={"large"}/>
                                                            </Tooltip> :
                                                            <Tooltip title={"Nieaktywny"}>
                                                                <WifiTetheringOff color={"error"} size={"large"}/>
                                                            </Tooltip>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${location.devicesCount} urządzeń`}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(location.lastUpdated).toLocaleDateString()}
                                                    </TableCell>
                                                </>
                                            )}

                                            <TableCell>
                                                <Box sx={{display: 'flex', gap: 1}}>
                                                    <Tooltip title="Edytuj">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/home/${location.home_id}/edit`);
                                                            }}
                                                            sx={{color: 'primary.main'}}
                                                        >
                                                            <Edit fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Usuń">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(location.home_id);
                                                            }}
                                                            sx={{color: 'error.main'}}
                                                        >
                                                            <Delete fontSize="small"/>
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

                {filteredLocations.length > perPage && (
                    <Box sx={{
                        p: 2,
                        m: "auto",
                    }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            shape="rounded"
                            color="primary"
                            size="small"
                            showFirstButton
                            showLastButton
                            boundaryCount={1}
                            siblingCount={0}
                        />
                    </Box>
                )}
            </Grid>
        </Container>
    );
};

export default UserLocationsPage;