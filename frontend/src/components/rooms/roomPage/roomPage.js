import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Paper,
    Switch,
    Typography,
    styled, Chip
} from '@mui/material';
import {
  Lightbulb,
  Warning,
  Lock,
  Thermostat,
  DoorFront,
  Refresh,
  Wifi,
  WifiOff
} from '@mui/icons-material';
import client from "../../../client";
import { API_BASE_URL } from "../../../config";

const StatusCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const RoomPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const token = localStorage.getItem("access");

  // WebSocket setup
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket(`ws://127.0.0.1:8000/ws/room_updates/${id}/`);
    setWs(newWs);

    return () => newWs.close();
  }, [id]);

  useEffect(() => {
    if (!ws) return;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);
      if (data.type === 'state_update') {
        setRoom(prev => ({ ...prev, ...data.data }));
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsStatus('error');
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus('disconnected');
    };
  }, [ws]);

  // Fetch initial room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await client.get(`${API_BASE_URL}room/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(response.data);
      } catch (error) {
        console.error("Failed to fetch room data", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRoom();
  }, [token, id]);

  const handleLightToggle = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "toggle_light",
        room_id: id,
        state: !room.light
      }));
    }
  };

  const handleWarningToggle = async () => {
    try {
      const response = await client.put(`${API_BASE_URL}rooms/${id}/`, {
        warning: !room.warning
      });
      setRoom(prev => ({ ...prev, warning: response.data.warning }));
    } catch (error) {
      console.error('Error updating warning status:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await client.get(`${API_BASE_URL}room/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(response.data);
    } catch (error) {
      console.error("Failed to refresh room data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !room) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h3" component="h1">
          {room.name}
          <Typography variant="subtitle1" color="text.secondary" component="span" sx={{ ml: 2 }}>
            Floor {room.floor_number || 'N/A'}
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {wsStatus === 'connected' ? (
              <Wifi color="success" />
            ) : (
              <WifiOff color="error" />
            )}
            <Typography variant="caption" color="text.secondary">
              {wsStatus.charAt(0).toUpperCase() + wsStatus.slice(1)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Controls Column */}
        <Grid item xs={12} md={6}>
          <StatusCard elevation={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Lightbulb fontSize="large" color={room.light ? 'warning' : 'disabled'} />
                  <Box>
                    <Typography variant="h6">Lighting</Typography>
                    <Switch
                      checked={room.light}
                      onChange={handleLightToggle}
                      color="warning"
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Warning fontSize="large" color={room.warning ? 'error' : 'disabled'} />
                  <Box>
                    <Typography variant="h6">Security Alert</Typography>
                    <Switch
                      checked={room.warning}
                      onChange={handleWarningToggle}
                      color="error"
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Additional IoT Controls */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Lock fontSize="large" color="action" />
                  <Box>
                    <Typography variant="h6">Door Lock</Typography>
                    <Switch disabled color="primary" />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Thermostat fontSize="large" color="action" />
                  <Box>
                    <Typography variant="h6">Thermostat</Typography>
                    <Typography variant="body1">22.5°C</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </StatusCard>
        </Grid>

        {/* Room Info Column */}
        <Grid item xs={12} md={6}>
          <StatusCard elevation={3}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Room Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  <strong>Position:</strong>
                </Typography>
                <Typography variant="body1">
                  X: {room.position?.x || 'N/A'}, Y: {room.position?.y || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1" color="text.secondary">
                  <strong>Last Updated:</strong>
                </Typography>
                <Typography variant="body1">
                  {new Date(room.updated_at).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  <strong>Connected Devices:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip icon={<DoorFront />} label="Smart Door" variant="outlined" />
                  <Chip icon={<Thermostat />} label="Thermostat" variant="outlined" />
                  <Chip icon={<Lightbulb />} label="Smart Lights" variant="outlined" />
                </Box>
              </Grid>
            </Grid>
          </StatusCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomPage;