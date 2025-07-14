import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography,
  Avatar,
  Divider,
  Chip,
  Badge,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Tooltip, styled
} from "@mui/material";
import {
  Add,
  Search,
  MeetingRoom,
  LocationOn,
  Layers,
  ArrowForward,
  Sensors,
  Star,
  FilterList,
  Refresh,
  ViewModule,
  ViewList,
  MoreVert,
  Thermostat,
  Lightbulb,
  Security,
  People, MapsHomeWork, HelpOutline, QuestionMark, QuestionMarkOutlined
} from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";

const RoomCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderLeft: `4px solid ${theme.palette.primary.main}`
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  backgroundColor:
    status === 'active' ? theme.palette.success.light :
    status === 'warning' ? theme.palette.warning.light :
    theme.palette.error.light,
  color:
    status === 'active' ? theme.palette.success.dark :
    status === 'warning' ? theme.palette.warning.dark :
    theme.palette.error.dark
}));

const UserRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsResponse, locationsResponse] = await Promise.all([
          client.get(API_BASE_URL + "myRooms/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          client.get(API_BASE_URL + "myHomes/", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        // Add mock status for demo purposes
        const roomsWithStatus = roomsResponse.data.map(room => ({
          ...room,
          status: Math.random() > 0.3 ? 'active' : Math.random() > 0.5 ? 'warning' : 'error',
          last_activity: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        }));

        setRooms(roomsWithStatus);
        setFilteredRooms(roomsWithStatus);
        setLocations(locationsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedLocation) {
      const locationFloors = locations.find(loc => loc.name === selectedLocation)?.floors || [];
      setFloors(locationFloors);
      setSelectedFloor(locationFloors[0] || "");
    }
  }, [selectedLocation, locations]);

  useEffect(() => {
    let filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedLocation || room.location === selectedLocation) &&
      (!selectedFloor || room.floor === selectedFloor) &&
      (activeTab === 0 ||
       (activeTab === 1 && room.is_favorite) ||
       (activeTab === 2 && room.status === 'active') ||
       (activeTab === 3 && room.status === 'warning') ||
       (activeTab === 4 && room.status === 'error'))
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [search, selectedLocation, selectedFloor, rooms, activeTab]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await client.get(API_BASE_URL + "myRooms/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error) {
      console.error("Failed to refresh rooms", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Pomieszczenia
            <sup><Tooltip sx={{ml:1}} title={'Pomieszczenia mogą być edytowane na stronie lokacji w dedykowanym edytorze.'}>
              <HelpOutline/>
            </Tooltip></sup>
          </Typography>


          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Odśwież">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>

          </Box>
        </Box>
        

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Wszystkie" icon={<MapsHomeWork fontSize="small" />} />
          <Tab label="Ulubione" icon={<Star fontSize="small" />} />
        </Tabs>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Wyszukaj pomieszczenie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Select
              fullWidth
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <LocationOn color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>All Locations</em>
              </MenuItem>
              {locations.map(loc => (
                <MenuItem key={loc.id} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={2}>
              <Select
                fullWidth
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                disabled={!selectedLocation}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <Layers color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>All Floors</em>
                </MenuItem>
                {floors.map(floor => (
                  <MenuItem key={floor.id} value={floor.id}>
                    Piętro {floor.floor_number}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <List sx={{ width: '100%' }}>
            {currentItems.length > 0 ? (
              <Stack spacing={2}>
                {currentItems.map((room) => (
                  <Card
                    key={room.room_id}
                    component={Button}
                    href={`/room/${room.room_id}`}
                    sx={{
                      p: 0,
                      width: '100%',
                      textAlign: 'left',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <ListItem sx={{ width: '100%' }}>
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <StatusBadge
                              status={room.status}
                              size="small"
                              label={room.status.toUpperCase()}
                            />
                          }
                        >
                          <Avatar sx={{
                            bgcolor: room.is_favorite ? 'warning.light' : 'primary.light',
                            color: room.is_favorite ? 'warning.dark' : 'primary.dark',
                            mr: 2
                          }}>
                            {room.is_favorite ? <Star /> : <MeetingRoom />}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
                              {room.name}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <People fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {Math.floor(Math.random() * 10)}/10
                                </Typography>
                              </Box>
                              <Badge
                                badgeContent={room.device_count}
                                color="primary"
                                sx={{ mr: 2 }}
                              >
                                <Sensors color="action" />
                              </Badge>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <>
                            <Box display="flex" gap={2} alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                {room.location}
                              </Typography>
                              <Chip
                                label={`Floor ${room.floor}`}
                                size="small"
                                color="info"
                                icon={<Layers fontSize="small" />}
                              />
                            </Box>
                            {room.last_activity && (
                              <Typography variant="caption" color="text.secondary">
                                Ostatnia aktywność: {new Date(room.last_activity).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ArrowForward color="action" />
                    </ListItem>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                Brak pomieszczeń spełniających kryteria
              </Typography>
            )}
          </List>
        </Paper>


      {filteredRooms.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default UserRoomsPage;