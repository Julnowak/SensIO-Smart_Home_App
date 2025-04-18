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
    Chip, Badge, Stack
} from "@mui/material";
import {
    Add,
    Search,
    MeetingRoom,
    LocationOn,
    Layers,
    ArrowForward, Sensors, Star
} from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";

const UserRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [floors, setFloors] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, locationsResponse] = await Promise.all([
          client.get(API_BASE_URL + "myRooms/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          client.get(API_BASE_URL + "myHomes/", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setRooms(roomsResponse.data);
        setFilteredRooms(roomsResponse.data);
        setLocations(locationsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
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
      (!selectedFloor || room.floor === selectedFloor)
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [search, selectedLocation, selectedFloor, rooms]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            <MeetingRoom sx={{ verticalAlign: 'middle', mr: 1 }} />
            Moje Pokoje
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            href="/add-room"
            sx={{ minWidth: 200 }}
          >
            Dodaj Pokój
          </Button>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Szukaj pokoju..."
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
          <Grid item xs={12} md={3}>
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
                <em>Wszystkie lokacje</em>
              </MenuItem>
              {locations.map(loc => (
                <MenuItem key={loc.id} value={loc.name}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
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
                <em>Wszystkie piętra</em>
              </MenuItem>
              {floors.map(floor => (
                <MenuItem key={floor} value={floor}>
                  Piętro {floor}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

            <List sx={{ mb: 4, width: '100%' }}>
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
                      transform: 'translateX(5px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <ListItem sx={{ width: '100%' }}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: room.is_favorite ? 'warning.light' : 'primary.main',
                        mr: 2
                      }}>
                        {room.is_favorite ? <Star /> : <MeetingRoom />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
                            {room.name}
                          </Typography>
                          <Badge
                            badgeContent={room.device_count}
                            color="primary"
                            sx={{ mr: 2 }}
                          >
                            <Sensors color="action" />
                          </Badge>
                          <Chip
                            label={`Piętro ${room.floor}`}
                            size="small"
                            color="info"
                            icon={<Layers fontSize="small" />}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {room.location}
                          </Typography>
                          {room.last_activity && (
                            <Typography variant="caption" color="text.secondary">
                              Ostatnia aktywność: {new Date(room.last_activity).toLocaleString()}
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
              Brak pokoi spełniających kryteria wyszukiwania
            </Typography>
          )}
        </List>

        <Box display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default UserRoomsPage;