import React, {useState, useEffect} from "react";
import {
    Box,
    Button,
    Container,
    Grid,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    TextField,
    Typography,
    Avatar,
    Chip,
    Tabs,
    Tab,
    LinearProgress,
    IconButton,
    Tooltip,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    useTheme,
    useMediaQuery,
    InputLabel, FormControl, Autocomplete, Badge
} from "@mui/material";
import {
    Search,
    MeetingRoom,
    LocationOn,
    Layers,
    Star,
    MapsHomeWork,
    HelpOutline,
    WifiTethering,
    WifiTetheringOff,
    LightbulbOutlined,
    Warning,
    FilterAlt,
    FilterAltOff,
    Close, Lightbulb, Check, Refresh
} from "@mui/icons-material";
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";
import {useNavigate} from "react-router-dom";


const UserRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [filteredFloors, setFilteredFloors] = useState([]);
    const [locations, setLocations] = useState([]);
    const [floors, setFloors] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState("");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [lightFilter, setLightFilter] = useState('all');
    const [warningFilter, setWarningFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');

    const token = localStorage.getItem("access");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await
                client.get(API_BASE_URL + "myRooms/", {
                    headers: {Authorization: `Bearer ${token}`},
                });

            setRooms(response.data.roomsData);
            setFilteredRooms(response.data.roomsData);
            setLocations(response.data.locationsData);
            setFloors(response.data.floorsData);
            setFilteredFloors(response.data.floorsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);


    useEffect(() => {
        let filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(search.toLowerCase()) &&
            (!selectedLocation || room.home.home_id === selectedLocation.home_id) &&
            (!selectedFloor || room.floor.floor_id === selectedFloor.floor_id) &&
            (lightFilter === "all" || lightFilter === room.light) &&
            (warningFilter === "all" || warningFilter === room.warning) &&
            (statusFilter === "all" || statusFilter === room.isActive) &&
            (activeTab === 0 ||
                (activeTab === 1 && room.isFavorite) ||
                (activeTab === 2 && room.warning)));
        setFilteredRooms(filtered);
        setCurrentPage(1);
    }, [statusFilter, warningFilter, lightFilter, search, selectedLocation, selectedFloor, rooms, activeTab]);

    const handleSearch = () => {
        let filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(search.toLowerCase()) &&
            (!selectedLocation || room.home.home_id === selectedLocation.home_id) &&
            (!selectedFloor || room.floor.floor_id === selectedFloor.floor_id) &&
            (lightFilter === "all" || lightFilter === room.light) &&
            (warningFilter === "all" || warningFilter === room.warning) &&
            (statusFilter === "all" || statusFilter === room.isActive));
        setFilteredRooms(filtered);
        setCurrentPage(1);
    };

    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredRooms.length, 1) / perPage);

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{mb: 2}}
            >
                <Typography variant="h4" component="h1" fontWeight={700}>
                    Moje pomieszczenia
                </Typography>
                <Tooltip placement="left"
                         title="Pomieszczenia mogą być edytowane na stronie lokacji w dedykowanym edytorze.">
                    <IconButton>
                        <HelpOutline size={"large"}/>
                    </IconButton>
                </Tooltip>
            </Box>


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
                                onClick={() => fetchData()}
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
                                            setFilteredRooms([...filteredRooms].sort((a, b) => b.name.localeCompare(a.name)))
                                        } else if (e.target.value === "name_asc") {
                                            setFilteredRooms([...filteredRooms].sort((a, b) => a.name.localeCompare(b.name)))
                                        } else if (e.target.value === "date_desc") {
                                            setFilteredRooms([...filteredRooms].sort((a, b) => {
                                                if (!a.lastUpdated && !b.lastUpdated) return 0;
                                                if (!a.lastUpdated) return 1;
                                                if (!b.lastUpdated) return -1;
                                                return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                                            }));
                                        } else if (e.target.value === "date_asc") {
                                            setFilteredRooms([...filteredRooms].sort((a, b) => {
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
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={[{id: 'all', name: 'Wszystkie lokalizacje'}, ...locations]}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedLocation || {id: 'all', name: 'Wszystkie lokalizacje'}}
                                        onChange={(e, newValue) => {
                                            const isAllSelected = newValue?.id === 'all';
                                            setSelectedLocation(isAllSelected ? null : newValue);
                                            if (newValue) {
                                                setFilteredFloors(isAllSelected ? [] : floors.filter((f) => f.home.home_id === newValue.home_id));
                                            }
                                            setSelectedFloor(null);
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

                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={[{id: 'all', floor_number: 'Wszystkie piętra'}, ...filteredFloors]}
                                        getOptionLabel={(option) =>
                                            option?.floor_number ?
                                                (option.id === 'all' ? option.floor_number : `Piętro ${option.floor_number}`) :
                                                "Wybierz piętro"
                                        }
                                        value={selectedFloor || {id: 'all', floor_number: 'Wszystkie piętra'}}
                                        onChange={(e, newValue) => {
                                            setSelectedFloor(newValue?.id === 'all' ? null : newValue);
                                        }}
                                        disabled={!selectedLocation && filteredFloors.length === 0}
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
                                        <InputLabel>Status światła</InputLabel>
                                        <Select
                                            value={lightFilter}
                                            onChange={(e) => setLightFilter(e.target.value)}
                                            label="Status światła"
                                        >
                                            <MenuItem value="all">Wszystkie</MenuItem>
                                            <MenuItem value={true}>Włączone</MenuItem>
                                            <MenuItem value={false}>Wyłączone</MenuItem>
                                        </Select>
                                    </FormControl>
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
                                {lightFilter !== 'all' && (
                                    <Chip
                                        label={`Światło: ${lightFilter === 'on' ? 'Włączone' : 'Wyłączone'}`}
                                        onDelete={() => setLightFilter('all')}
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
                                            <TableCell sx={{fontWeight: 'bold', textAlign: "center"}}>Alarm</TableCell>
                                            <TableCell sx={{fontWeight: 'bold', textAlign: "center"}}>Status</TableCell>
                                            <TableCell
                                                sx={{fontWeight: 'bold', textAlign: "center"}}>Światło</TableCell>
                                        </>)}

                                    <TableCell sx={{fontWeight: 'bold'}}>Lokalizacja</TableCell>

                                    {!isMobile && (
                                        <TableCell sx={{fontWeight: 'bold', minWidth: 150}}>Ostatnia
                                            aktualizacja</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRooms.map((room) => (
                                    <TableRow
                                        key={room.room_id}
                                        hover
                                        onClick={() => navigate(`/room/${room.room_id}`)}
                                        sx={{cursor: 'pointer', '&:last-child td': {borderBottom: 0}}}
                                    >
                                        <TableCell>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                                    badgeContent={
                                                        room.isFavorite ? (
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
                                                            color: theme.palette.mode === "dark" ? "gray" : "black",
                                                            backgroundColor: "#00000000",
                                                            width: 40,
                                                            height: 40,
                                                        }}
                                                    >
                                                        <MeetingRoom/>
                                                    </Avatar>
                                                </Badge>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {room.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {!isMobile && (
                                            <>
                                                <TableCell sx={{textAlign: 'center'}}>
                                                    {room.warning ? <Warning size={"large"} color={"warning"}/> : <Check size={"large"} color={"action"}/> }
                                                </TableCell></>)}
                                        <TableCell sx={{textAlign: 'center'}}>
                                            {room.isActive ?
                                                <Tooltip title={"Aktywny"}>
                                                    <WifiTethering color={"success"} size={"large"}/><br/> {room.activeDevices}
                                                </Tooltip> :
                                                <Tooltip title={"Nieaktywny"}>
                                                    <WifiTetheringOff color={"error"} size={"large"}/>
                                                    <br/>
                                                    {room.activeDevices}
                                                </Tooltip>}
                                        </TableCell>
                                        <TableCell sx={{textAlign: 'center'}}>
                                            {room.light ? <Lightbulb size={"large"} color={"warning"}/> :
                                                <LightbulbOutlined size={"large"} color={"gray"}/>}
                                        </TableCell>

                                        <TableCell>
                                            {room.floor?.floor_number && (
                                                <Chip
                                                    label={`Piętro ${room.floor?.floor_number}`}
                                                    variant="outlined"
                                                    size="small"
                                                    color={"secondary"}
                                                    sx={{m: 0.2}}
                                                />)}
                                            {room.home?.name && (
                                                <Chip
                                                    label={`${room.home?.name}`}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{m: 0.2}}
                                                />)}
                                        </TableCell>

                                        {!isMobile && (
                                            <>
                                                {room?.lastUpdated ? (
                                                        <TableCell>
                                                            {new Date(room.lastUpdated).toLocaleDateString()}, {new Date(room.lastUpdated).toLocaleTimeString()}
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


            {filteredRooms.length === 0 && (
                <Typography textAlign="center" color="text.secondary" mt={5}>
                    Brak pomieszczeń spełniających kryteria wyszukiwania.
                </Typography>
            )}

            {filteredRooms.length > perPage && (
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

export default UserRoomsPage;