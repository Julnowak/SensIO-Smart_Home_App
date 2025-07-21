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
    Badge,
    TableCell,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    useTheme,
    useMediaQuery,
    Tabs,
    Tab,
    FormControl, InputLabel, Autocomplete, InputAdornment, LinearProgress
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
    HealthAndSafety,
    ListAlt,
    ViewComfy,
    WifiTethering,
    WifiTetheringOff,
    Star,
    MeetingRoom,
    Warning,
    Check,
    MapsHomeWork, Refresh, FilterAltOff, FilterAlt, Layers, Close, Archive, PublishedWithChanges, Unarchive
} from "@mui/icons-material";
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const token = localStorage.getItem("access");
    const [warningFilter, setWarningFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);


    const fetchLocations = async () => {
        try {
            setLoading(true)
            const response = await client.get(API_BASE_URL + "myHomes/", {
                headers: {Authorization: `Bearer ${token}`}
            });
            setLocations(response.data);
            setFilteredLocations(response.data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        token && fetchLocations();
    }, [token]);


    useEffect(() => {
        let filtered = locations.filter(room =>
            room.name.toLowerCase().includes(search.toLowerCase()) &&
            (warningFilter === "all" || warningFilter === room.warning) &&
            (statusFilter === "all" || statusFilter === room.isActive) &&
            (activeTab === 0 ||
                (activeTab === 1 && room.isFavorite) ||
                (activeTab === 2 && room.warning)||
                (activeTab === 3 && room.isArchived)));
        setFilteredLocations(filtered);

    }, [statusFilter, warningFilter, search, activeTab, locations]);


    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredLocations.length, 1) / perPage);
    const navigate = useNavigate();

    function handleSearch() {

    }

    const handleArchive = async (homeId) => {
        try {
            await client.put(`${API_BASE_URL}home/${homeId}/`, {
                "archive": true
            },{
                headers: {Authorization: `Bearer ${token}`},
            });

            setLocations(prevLocations =>
                prevLocations.map(location =>
                  location.home_id === homeId
                    ? { ...location, isArchived: !location.isArchived }
                    : location
                )
              );

        } catch (error) {
            console.error("Failed to delete location", error);
        }
    }

    const handleChangeCurrent = async (homeId) => {
        try {
            await client.put(`${API_BASE_URL}home/${homeId}/`, {
                "changeCurrent": true
            }, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setLocations(prevLocations =>
                prevLocations.map(location =>
                    location.current === true
                        ? {...location, current: false}
                        : location
                )
            );

            setLocations(prevLocations =>
                prevLocations.map(location =>
                    location.home_id === homeId
                        ? {...location, current: true}
                        : location
                )
            );

        } catch (error) {
            console.error("Failed to delete location", error);
        }
    }

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
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

            <Grid item xs={12}>
                <Paper elevation={0}
                       sx={{
                           p: {xs: 1, sm: 2},
                           border: "1px solid #00000020",
                           boxShadow: '0px 2px 12px rgba(0,0,0,0.05)'
                       }}>

                    <Box
                        display="flex"
                        flexDirection={{xs: 'column', md: 'row'}}
                        justifyContent="space-between"
                        alignItems={{xs: 'stretch', sm: 'center'}}
                        gap={2}
                        mb={1}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{
                                width: '100%',
                                maxWidth: '100%',
                                '& .MuiTab-root': {
                                    minHeight: 48,
                                    minWidth: 'unset',
                                    px: 1.5,
                                    fontSize: {xs: '0.7rem', sm: '0.8125rem'}
                                },
                                mb: 1
                            }}
                        >
                            <Tab label="Wszystkie" icon={<MapsHomeWork fontSize="small"/>} iconPosition="start"/>
                            <Tab label="Ulubione" icon={<Star fontSize="small"/>} iconPosition="start"/>
                            <Tab label="Ostrzeżenia" icon={<Warning fontSize="small"/>} iconPosition="start"/>
                            <Tab label="Zarchiwizowane" icon={<Archive fontSize="small"/>} iconPosition="start"/>
                        </Tabs>

                        <Box
                            display="flex"
                            flexDirection={{
                                xs: 'row',
                                sm: 'row'
                            }}  // Zawsze w rzędzie, niezależnie od rozmiaru ekranu
                            gap={1}  // Mniejszy gap na małych ekranach
                            alignItems="center"
                            sx={!isMobile ? {width: {xs: '100%', md: 'auto'}} : null}
                        >
                            <IconButton
                                onClick={() => fetchLocations()}
                                sx={{
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 1.2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        borderColor: 'primary.light'
                                    }
                                }}
                            >
                                <Tooltip title={"Odśwież"}>
                                    <Refresh color="action" fontSize="small"/>
                                </Tooltip>

                            </IconButton>

                            <IconButton
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                sx={{
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    p: 1.2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        borderColor: 'primary.light'
                                    }
                                }}
                            >
                                <Tooltip title={showAdvancedFilters ? "Ukryj" : "Filtry"}>
                                    {showAdvancedFilters ? <FilterAltOff color="action" fontSize="small"/> :
                                        <FilterAlt color="action" fontSize="small"/>}
                                </Tooltip>
                            </IconButton>

                            <FormControl sx={{
                                minWidth: 140,
                                width: {xs: '100%', sm: 'auto'},
                                '& .MuiInputBase-root': {
                                    height: '40px'
                                }
                            }}>
                                <InputLabel sx={{
                                    lineHeight: '1.2rem',
                                    transform: 'translate(14px, 12px) scale(1)',
                                    '&.MuiInputLabel-shrink': {
                                        transform: 'translate(14px, -6px) scale(0.75)'
                                    }
                                }}>Sortuj według</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value)
                                        if (e.target.value === "name_desc") {
                                            setFilteredLocations([...filteredLocations].sort((a, b) => b.name.localeCompare(a.name)))
                                        } else if (e.target.value === "name_asc") {
                                            setFilteredLocations([...filteredLocations].sort((a, b) => a.name.localeCompare(b.name)))
                                        } else if (e.target.value === "date_desc") {
                                            setFilteredLocations([...filteredLocations].sort((a, b) => {
                                                if (!a.lastUpdated && !b.lastUpdated) return 0;
                                                if (!a.lastUpdated) return 1;
                                                if (!b.lastUpdated) return -1;
                                                return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                                            }));
                                        } else if (e.target.value === "date_asc") {
                                            setFilteredLocations([...filteredLocations].sort((a, b) => {
                                                if (!a.lastUpdated && !b.lastUpdated) return 0;
                                                if (!a.lastUpdated) return 1;
                                                if (!b.lastUpdated) return -1;
                                                return new Date(a.lastUpdated) - new Date(b.lastUpdated); // Ascending
                                            }));
                                        }
                                    }}
                                    label="Sortuj według"
                                    size="small"
                                    sx={{
                                        borderRadius: '10px',
                                        '& .MuiSelect-select': {
                                            py: 1,
                                            fontSize: {xs: '0.875rem', sm: '1rem'}  // Mniejsza czcionka na małych ekranach
                                        }
                                    }}
                                >
                                    <MenuItem value="date_desc">Data aktualizacji (malejąco)</MenuItem>
                                    <MenuItem value="date_asc">Data aktualizacji (rosnąco)</MenuItem>
                                    <MenuItem value="name_asc">Nazwa (A-Z)</MenuItem>
                                    <MenuItem value="name_desc">Nazwa (Z-A)</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {showAdvancedFilters && (
                        <Box sx={{
                            mb: 3,
                            pt: 1, pb: 1,
                            borderRadius: '12px',
                        }}>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, sm: 6, md: 4}}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status ostrzeżenia</InputLabel>
                                        <Select
                                            value={warningFilter}
                                            onChange={(e) => setWarningFilter(e.target.value)}
                                            label="Status ostrzeżenia"
                                        >
                                            <MenuItem value="all">Wszystkie</MenuItem>
                                            <MenuItem value={true}>Aktywne</MenuItem>
                                            <MenuItem value={false}>Nieaktywne</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{xs: 12, sm: 6, md: 4}}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status pokoju</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            label="Status światła"
                                        >
                                            <MenuItem value="all">Wszystkie</MenuItem>
                                            <MenuItem value={true}>Online</MenuItem>
                                            <MenuItem value={false}>Offline</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {!showAdvancedFilters && (
                        <>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                {warningFilter !== 'all' && (

                                    <Chip
                                        label={`Ostrzeżenie: ${warningFilter === 'active' ? 'Aktywne' : 'Nieaktywne'}`}
                                        onDelete={() => setWarningFilter('all')}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {warningFilter !== "all" && (
                                    <Tooltip title={"Wyczyść filtry"}>
                                        <Chip
                                            label={<Close fontSize={"small"}/>}
                                            variant="outlined"
                                            onClick={() => {
                                                setWarningFilter("all")
                                            }}
                                            color={"action"}
                                            size="small"
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                        </>
                    )}


                    {/* Search Bar */}
                    <Box
                        display="flex"
                        flexDirection={{xs: 'column', sm: 'row'}}
                        gap={2}
                        alignItems="center"
                        mb={2}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Wyszukaj po nazwie..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                sx: {
                                    borderRadius: '10px',
                                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d'
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Search/>}
                            onClick={handleSearch}
                            sx={{
                                borderRadius: '10px',
                                px: 3,
                                py: 1.5,
                                whiteSpace: 'nowrap',
                                minWidth: '120px',
                                width: {xs: '100%', sm: 'auto'}
                            }}
                        >
                            Szukaj
                        </Button>
                    </Box>
                </Paper>
            </Grid>


            {loading && <LinearProgress sx={{mb: 2}}/>}

            <Grid size={{xs: 12}}>
                <Paper elevation={0}
                       sx={{
                           width: "100%",
                           border: "1px solid #00000020",
                           borderRadius: 2,
                           overflow: 'hidden',
                           mt: 2
                       }}>
                    <TableContainer sx={{maxHeight: 600}}>
                        <Table stickyHeader aria-label="locations table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontWeight: 'bold', minWidth: 200}}>Nazwa lokacji</TableCell>
                                    {!isMobile && (
                                        <>
                                            <TableCell
                                                sx={{fontWeight: 'bold', textAlign: "center"}}>Alarm</TableCell>
                                            <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                                            <TableCell sx={{fontWeight: 'bold', maxWidth: 60}}>Wybrany</TableCell>
                                            <TableCell sx={{fontWeight: 'bold', minWidth: 150}}>Ostatnia
                                                aktualizacja</TableCell>
                                            <TableCell sx={{fontWeight: 'bold', maxWidth: 80}}>Akcje</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedLocations.map((location) => (
                                    <TableRow
                                        key={location.home_id}
                                        hover
                                        sx={{cursor: 'pointer', '&:last-child td': {borderBottom: 0}}}
                                    >

                                        <TableCell onClick={() => navigate(`/home/${location.home_id}`)}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                                    badgeContent={
                                                        location.isFavorite ? (
                                                            <Star sx={{
                                                                color: 'gold',
                                                                fontSize: '1rem',
                                                                stroke: theme.palette.mode === "dark" ? "#ffecc0" : "#af7303",
                                                                strokeWidth: 1
                                                            }}/>
                                                        ) : null
                                                    }
                                                >
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
                                                </Badge>
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

                                        <TableCell onClick={() => navigate(`/home/${location.home_id}`)}
                                                   sx={{textAlign: 'center'}}>
                                            {location.warning ? <Warning size={"large"} color={"warning"}/> :
                                                "---"}
                                        </TableCell>

                                        {!isMobile && (
                                            <>
                                                <TableCell onClick={() => navigate(`/home/${location.home_id}`)}>
                                                    {location.isActive ?
                                                        <Tooltip title={"Aktywny"}>
                                                            <WifiTethering color={"success"}
                                                                           size={"large"}/><br/> {location.activeDevices}
                                                        </Tooltip> :
                                                        <Tooltip title={"Nieaktywny"}>
                                                            <WifiTetheringOff color={"error"}
                                                                              size={"large"}/><br/> {location.activeDevices}
                                                        </Tooltip>
                                                    }
                                                </TableCell>
                                                <TableCell onClick={() => navigate(`/home/${location.home_id}`)}>
                                                    {location.current ? <Check color={"success"}/> : "---"}
                                                </TableCell>
                                                {location?.lastUpdated ? (
                                                        <TableCell onClick={() => navigate(`/home/${location.home_id}`)}>
                                                            {new Date(location.lastUpdated).toLocaleDateString()}, {new Date(location.lastUpdated).toLocaleTimeString()}
                                                        </TableCell>
                                                    ) :
                                                    <TableCell onClick={() => navigate(`/home/${location.home_id}`)}>
                                                        <em>Brak aktywności</em>
                                                    </TableCell>
                                                }
                                                <TableCell sx={{
                                                    maxWidth: 80,

                                                    justifyContent: 'center'
                                                }}>
                                                    {!location.isArchived?
                                                    <Tooltip title="Archiwizuj">
                                                        <IconButton size="small" sx={{padding: '4px'}} onClick={()=>handleArchive(location.home_id)}>
                                                            <Archive fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>:
                                                    <Tooltip title="Przywróć">
                                                        <IconButton size="small" sx={{padding: '4px'}} onClick={()=>handleArchive(location.home_id)}>
                                                            <Unarchive fontSize="small"/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    }

                                                    {!location.current && (
                                                        <Tooltip title="Zmień na wybrany" >
                                                            <IconButton size="small" sx={{padding: '4px'}} onClick={()=> handleChangeCurrent(location.home_id)}>
                                                                <PublishedWithChanges fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>

                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>

            {filteredLocations.length === 0 && (
                <Typography textAlign="center" color="text.secondary" mt={5}>
                    Brak lokalizacji spełniających kryteria wyszukiwania.
                </Typography>
            )}

            {filteredLocations.length > perPage && (
                <Box sx={{
                    p: 2,
                    m: "auto",
                    justifyItems: "center"
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
        </Container>
    );
};

export default UserLocationsPage;