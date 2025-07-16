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
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Pagination,
    Paper,
    TextField,
    Typography,
    styled,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
    Tooltip,
    Chip,
    useMediaQuery,
    useTheme, Select, MenuItem, Tabs, Tab, FormControl, InputLabel, Autocomplete, LinearProgress, Badge
} from "@mui/material";
import {
    Add, Check, Close,
    Delete,
    Edit, FilterAlt, FilterAltOff, Layers,
    LocationOn,
    MapsHomeWork, MeetingRoom,
    Memory, Refresh,
    Search, Star, Warning,
    WifiTethering,
    WifiTetheringOff
} from "@mui/icons-material";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import {useNavigate} from "react-router-dom";

const ColorDot = styled('span')(({color}) => ({
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 12,
    backgroundColor: color || '#ccc',
}));

const StyledListItem = styled(ListItem)(({theme}) => ({
    borderRadius: 8,
    marginBottom: theme.spacing(1),
    boxShadow: theme.shadows[1],
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        backgroundColor: theme.palette.action.hover,
    },
}));

const UserDevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [filteredFloors, setFilteredFloors] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("access");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [lightFilter, setLightFilter] = useState('all');
    const [warningFilter, setWarningFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const response = await client.get(`${API_BASE_URL}myDevices/`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setDevices(response.data.devicesData);
            setFilteredDevices(response.data.devicesData)
            setFilteredRooms(response.data.roomsData)
            setFilteredFloors(response.data.floorsData)
            setRooms(response.data.roomsData)
            setFloors(response.data.floorsData)
            setLocations(response.data.locationsData)
        } catch (error) {
            console.error("Błąd podczas pobierania urządzeń", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        if (token) fetchDevices();
    }, [token]);

    useEffect(() => {
        let filtered = devices.filter(device =>
            device.name.toLowerCase().includes(search.toLowerCase()) &&
            (!selectedLocation || device.location.home_id === selectedLocation.home_id) &&
            (!selectedFloor || (device?.floor? device?.floor.floor_id === selectedFloor.floor_id: null)) &&
            (!selectedRoom || (device?.room? device?.room.room_id === selectedRoom.room_id: null)) &&
            (warningFilter === "all" || warningFilter === device.warning) &&
            (statusFilter === "all" || statusFilter === device.isActive) &&
            (activeTab === 0 ||
                (activeTab === 1 && device.isFavorite) ||
                (activeTab === 2 && device.warning)));
        setFilteredDevices(filtered);
        setCurrentPage(1);

    }, [statusFilter, warningFilter, lightFilter, search, selectedLocation, selectedFloor,selectedRoom, rooms, activeTab, devices]);

    const handleSearch = () => {
    };

    const [perPage] = useState(5);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedDevices = filteredDevices?.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredDevices?.length, 1) / perPage);

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
                            Moje urządzenia
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={<Add/>}
                                href="/newDevice"
                                sx={{minWidth: 200}}
                            >
                                Nowe urządzenie
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>


            <Grid item xs={12}>
                <Paper elevation={0}
                       sx={{
                           p: {xs: 1, sm: 2},
                           border: "1px solid #00000020",
                           boxShadow: '0px 2px 12px rgba(0,0,0,0.05)'
                       }}>
                    {/* Tabs Section */}
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
                        </Tabs>

                        <Box
                            display="flex"
                            flexDirection={{xs: 'row', sm: 'row'}}  // Zawsze w rzędzie, niezależnie od rozmiaru ekranu
                            gap={1}  // Mniejszy gap na małych ekranach
                            alignItems="center"
                            sx={!isMobile ? {width: {xs: '100%', md: 'auto'}} : null}
                        >
                            <IconButton
                                onClick={() => fetchDevices()}
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
                                            setFilteredDevices([...filteredDevices].sort((a, b) => b.name.localeCompare(a.name)))
                                        } else if (e.target.value === "name_asc") {
                                            setFilteredDevices([...filteredDevices].sort((a, b) => a.name.localeCompare(b.name)))
                                        } else if (e.target.value === "date_desc") {
                                            setFilteredDevices([...filteredDevices].sort((a, b) => {
                                                if (!a.lastUpdated && !b.lastUpdated) return 0;
                                                if (!a.lastUpdated) return 1;
                                                if (!b.lastUpdated) return -1;
                                                return b.lastUpdated.localeCompare(a.lastUpdated);
                                            }));
                                        } else if (e.target.value === "date_asc") {
                                            setFilteredDevices([...filteredDevices].sort((a, b) => {
                                                if (!a.lastUpdated && !b.lastUpdated) return 0;
                                                if (!a.lastUpdated) return -1;
                                                if (!b.lastUpdated) return 1;
                                                return b.lastUpdated.localeCompare(a.lastUpdated);
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
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={[{id: 'all', name: 'Wszystkie lokalizacje'}, ...locations]}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedLocation || {id: 'all', name: 'Wszystkie lokalizacje'}}
                                        onChange={(e, newValue) => {
                                            const isAllSelected = newValue?.id === 'all';
                                            setSelectedLocation(isAllSelected ? "" : newValue);
                                            if (newValue) {
                                                setFilteredFloors(isAllSelected ? [] : floors.filter((f) => f.home.home_id === newValue.home_id));
                                                setFilteredRooms(isAllSelected ? [] : rooms.filter((r) => (r.home? r.home.home_id === newValue.home_id: null)));
                                            }

                                            setSelectedFloor("");
                                            setSelectedRoom("")
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Lokalizacja"
                                                variant="outlined"
                                                fullWidth
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
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={[{id: 'all', floor_number: 'Wszystkie piętra'}, ...filteredFloors]}
                                        getOptionLabel={(option) =>
                                            option?.floor_number ?
                                                (option.id === 'all' ? option.floor_number : `Piętro ${option.floor_number}`) :
                                                "Wybierz piętro"
                                        }
                                        value={selectedFloor || {id: 'all', floor_number: 'Wszystkie piętra'}}
                                        onChange={(e, newValue) => {
                                            const isAllSelected = newValue?.id === 'all';
                                            setSelectedFloor(isAllSelected ? null : newValue);

                                            if (newValue) {
                                                setFilteredRooms(isAllSelected ? [] : rooms.filter((r) => (r.floor?.floor_id === newValue.floor_id) && (r.home.home_id === newValue.home.home_id)));
                                            }
                                            if (isAllSelected) {
                                                setFilteredRooms(rooms.filter((r) => r.home?.home_id === newValue.home?.home_id));
                                            }
                                        }}
                                        disabled={(!selectedLocation || selectedLocation === "Wszystkie lokalizacje")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Piętro"
                                                variant="outlined"
                                                fullWidth
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <Layers color="action" sx={{mr: 1}}/>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={[{id: 'all', name: 'Wszystkie pokoje'}, ...filteredRooms]}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedRoom || {id: 'all', name: 'Wszystkie pokoje'}}
                                        onChange={(e, newValue) => {
                                            setSelectedRoom(newValue?.id === 'all' ? null : newValue);
                                        }}
                                        disabled={(!selectedLocation || selectedLocation === "Wszystkie lokalizacje")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Piętro"
                                                variant="outlined"
                                                fullWidth
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <Layers color="action" sx={{mr: 1}}/>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={4}>
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

                                <Grid item xs={12} sm={6} md={4}>
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
                                <Chip
                                    label={`Lokalizacja: ${selectedLocation?.name || 'Wszystkie'}`}
                                    onDelete={selectedLocation ? () => setSelectedLocation(null) : undefined}
                                    variant="outlined"
                                    size="small"
                                    sx={{display: selectedLocation ? 'flex' : 'none'}}
                                />
                                {selectedFloor && (
                                    <Chip
                                        label={`Piętro: ${selectedFloor.floor_number}`}
                                        onDelete={() => setSelectedFloor(null)}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {warningFilter !== 'all' && (

                                    <Chip
                                        label={`Ostrzeżenie: ${warningFilter === 'active' ? 'Aktywne' : 'Nieaktywne'}`}
                                        onDelete={() => setWarningFilter('all')}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {((warningFilter !== "all") || (lightFilter !== "all") || selectedFloor || selectedLocation) && (
                                    <Tooltip title={"Wyczyść filtry"}>
                                        <Chip
                                            label={<Close fontSize={"small"}/>}
                                            variant="outlined"
                                            onClick={() => {
                                                setLightFilter("all")
                                                setWarningFilter("all")
                                                setSelectedLocation("")
                                                setSelectedFloor("")
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


            <Grid item xs={12}>
                <Paper elevation={0}
                       sx={{width: "100%", border: "1px solid #00000020", borderRadius: 2, overflow: 'hidden', mt: 2}}>
                    <TableContainer sx={{maxHeight: 600}}>
                        <Table stickyHeader aria-label="locations table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontWeight: 'bold', minWidth: 200}}>Nazwa urządzenia</TableCell>
                                    {!isMobile && (
                                        <>
                                            <TableCell sx={{fontWeight: 'bold'}}>Alarm</TableCell>
                                            <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                                            <TableCell sx={{fontWeight: 'bold'}}>Nr. seryjny</TableCell>
                                        </>
                                    )}
                                    <TableCell sx={{fontWeight: 'bold'}}>Lokalizacja</TableCell>
                                    {!isMobile && (

                                        <TableCell sx={{fontWeight: 'bold', minWidth: 150}}>Ostatnia
                                            aktualizacja</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedDevices.map((device) => (
                                    <TableRow
                                        key={device.device_id}
                                        hover
                                        onClick={() => navigate(`/device/${device.device_id}`)}
                                        sx={{cursor: 'pointer', '&:last-child td': {borderBottom: 0}}}
                                    >
                                        <TableCell>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                                    badgeContent={
                                                        device.isFavorite ? (
                                                            <Star sx={{
                                                                color: 'gold',
                                                                fontSize: '1rem',
                                                                stroke: theme.palette.mode === "dark" ? "#ffecc0" : "#af7303",
                                                                strokeWidth: 1
                                                            }}/>
                                                        ) : null
                                                    }
                                                >
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            bgcolor: device.color,
                                                            color: 'black',
                                                            width: 40,
                                                            height: 40,
                                                        }}
                                                    >
                                                        <Memory/>
                                                    </Avatar>
                                                </Badge>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {device.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {!isMobile && (
                                            <>
                                                <TableCell sx={{textAlign: 'center'}}>
                                                    {device.warning ? <Warning size={"large"} color={"warning"}/> : <Check size={"large"} color={"action"}/> }
                                                </TableCell>
                                                <TableCell>
                                                    {device.isActive ?
                                                        <Tooltip title={"Aktywny"}>
                                                            <WifiTethering color={"success"} size={"large"}/>
                                                        </Tooltip> :
                                                        <Tooltip title={"Nieaktywny"}>
                                                            <WifiTetheringOff color={"error"} size={"large"}/>
                                                        </Tooltip>}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {device.serial_number}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {device.brand}{}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {device.room?.name && (
                                                        <Chip
                                                            label={`${device.room?.name}`}
                                                            variant="outlined"
                                                            size="small"
                                                            color={"primary"}
                                                            sx={{m: 0.2}}
                                                        />
                                                    )}
                                                    {device.floor?.floor_number && (
                                                        <Chip
                                                            label={`Piętro ${device.floor?.floor_number}`}
                                                            variant="outlined"
                                                            size="small"
                                                            color={"secondary"}
                                                            sx={{m: 0.2}}
                                                        />)}
                                                    {device.location?.name && (
                                                        <Chip
                                                            label={`${device.location?.name}`}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{m: 0.2}}
                                                        />)}
                                                </TableCell>
                                                {device.lastUpdated ? (
                                                        <TableCell>
                                                            {new Date(device.lastUpdated).toLocaleDateString()}, {new Date(device.lastUpdated).toLocaleTimeString()}
                                                        </TableCell>
                                                    ) :
                                                    <TableCell>
                                                        <em>Brak aktywności</em>
                                                    </TableCell>
                                                }

                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>

            {filteredDevices?.length === 0 && (
                <Typography textAlign="center" color="text.secondary" mt={5}>
                    Brak urządzeń spełniających kryteria wyszukiwania.
                </Typography>
            )}

            {filteredDevices?.length > perPage && (
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


        </Container>
    );
};

export default UserDevicesPage;
