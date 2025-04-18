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
  TextField,
  Typography,
  styled
} from "@mui/material";
import { Add, Delete, Edit, Search, Settings } from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import {useNavigate} from "react-router-dom";

const ColorIndicator = styled('div')(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: 16,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateX(5px)',
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiListItemSecondaryAction-root': {
    right: theme.spacing(2)
  }
}));

const UserDevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await client.get(API_BASE_URL + "myDevices/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(response.data);
        setFilteredDevices(response.data);
      } catch (error) {
        console.error("Failed to fetch devices", error);
      }
    };

    token && fetchDevices();
  }, [token]);

  useEffect(() => {
    const filtered = devices.filter(device =>
      device.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDevices(filtered);
    setCurrentPage(1);
  }, [search, devices]);

  const handleDelete = async (deviceId) => {
    if(window.confirm("Czy na pewno chcesz usunąć to urządzenie?")) {
      try {
        await client.delete(`${API_BASE_URL}myDevices/${deviceId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevices(devices.filter(device => device.device_id !== deviceId));
      } catch (error) {
        console.error("Failed to delete device", error);
      }
    }
  };
  const navigate = useNavigate()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1">
                Moje Urządzenia
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/newDevice"
                sx={{ minWidth: 200 }}
              >
                Nowe Urządzenie
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Szukaj urządzenia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <List sx={{ bgcolor: 'background.paper' }}>
              {filteredDevices
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((device) => (
                  <StyledListItem
                    key={device.device_id}
                    onClick={() => {navigate(`/device/${device.device_id}`)}}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" href={`/device/${device.device_id}/edit`}>
                          <Edit />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDelete(device.device_id)}>
                          <Delete color="error" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ColorIndicator color={device.color} />
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {device.name}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                            sx={{ ml: 2 }}
                          >
                            {device.brand}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="div">
                            Nr seryjny: {device.serial_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {device.room}
                          </Typography>
                        </>
                      }
                    />
                  </StyledListItem>
                ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Pagination
              count={Math.ceil(filteredDevices.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              shape="rounded"
              sx={{ display: 'flex', justifyContent: 'center' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserDevicesPage;