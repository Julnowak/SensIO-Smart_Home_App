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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Paper,
  TextField,
  Typography,
  styled
} from "@mui/material";
import { Add, Delete, Edit, Search } from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";

const ColorDot = styled('span')(({ color }) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: 12,
  backgroundColor: color || '#ccc',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
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
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await client.get(`${API_BASE_URL}myDevices/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(response.data);
        setFilteredDevices(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania urządzeń", error);
      }
    };
    if (token) fetchDevices();
  }, [token]);

  useEffect(() => {
    const filtered = devices.filter(device =>
      device.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDevices(filtered);
    setCurrentPage(1);
  }, [search, devices]);

  const handleDelete = async (deviceId) => {
    if (window.confirm("Czy na pewno chcesz usunąć to urządzenie?")) {
      try {
        await client.delete(`${API_BASE_URL}myDevices/${deviceId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevices(devices.filter(device => device.device_id !== deviceId));
      } catch (error) {
        console.error("Błąd podczas usuwania urządzenia", error);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Moje Urządzenia
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            href="/newDevice"
            sx={{ minWidth: 180 }}
          >
            Dodaj Urządzenie
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Wyszukaj urządzenie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <List>
          {filteredDevices
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((device) => (
              <StyledListItem
                key={device.device_id}
                onClick={() => navigate(`/device/${device.device_id}`)}
                secondaryAction={
                  <Box>
                    <IconButton href={`/device/${device.device_id}/edit`} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(device.device_id)} size="small">
                      <Delete color="error" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <ColorDot color={device.color} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {device.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 2 }}
                      >
                        {device.brand}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">
                        Nr seryjny: {device.serial_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lokalizacja: {device.room}
                      </Typography>
                    </>
                  }
                />
              </StyledListItem>
            ))}
        </List>

        {filteredDevices.length === 0 && (
          <Typography textAlign="center" color="text.secondary" mt={5}>
            Brak urządzeń spełniających kryteria wyszukiwania.
          </Typography>
        )}

        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredDevices.length / itemsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default UserDevicesPage;
