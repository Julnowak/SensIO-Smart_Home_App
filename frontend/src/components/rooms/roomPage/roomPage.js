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
  styled,
  Chip,
  Avatar,
  Divider,
  Badge,
  LinearProgress,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Lightbulb,
  Warning,
  Lock,
  Thermostat,
  DoorFront,
  Refresh,
  Wifi,
  WifiOff,
  Sensors,
  People,
  Air,
  MeetingRoom,
  Security,
  EnergySavingsLeaf,
  MoreVert,
  Timeline,
  History,
  Settings, Business, EventNote
} from '@mui/icons-material';
import client from "../../../client";
import { API_BASE_URL } from "../../../config";


const StatusCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6]
  }
}));

const DeviceCard = styled(Paper)(({ theme, active }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  borderLeft: `4px solid ${active ? theme.palette.success.main : theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const RoomPage = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState(0);
  const [energyUsage, setEnergyUsage] = useState({
    today: 15.2,
    week: 102.5,
    month: 420.8
  });
  const token = localStorage.getItem("access");
  const params = useParams();

  // Mock device data
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);

  // WebSocket setup
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket(`ws://127.0.0.1:8000/ws/room_updates/${params.id}/`);
    setWs(newWs);

    return () => newWs.close();
  }, [params]);

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

  const fetchRoom = async () => {
      try {
        const response = await client.get(`${API_BASE_URL}room/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(response.data.roomData);
        setDevices(response.data.devicesData)
        setSensors(response.data.sensorsData)
        console.log(response.data.devicesData)

      } catch (error) {
        console.error("Failed to fetch room data", error);
      } finally {
        setLoading(false);
      }
    };

  // Fetch initial room data
  useEffect(() => {
    if (token) fetchRoom();
  }, [token, params]);

  const handleDeviceToggle = (deviceId) => {
    // const updatedDevices = devices?.map(device =>
    //   device.id === deviceId ? { ...device, status: !device.status } : device
    // );
    // // setDevices(updatedDevices);
    //
    // if (ws && ws.readyState === WebSocket.OPEN) {
    //   const device = updatedDevices.find(d => d.id === deviceId);
    //   ws.send(JSON.stringify({
    //     type: "device_update",
    //     device_id: deviceId,
    //     state: device.status
    //   }));
    // }
  };

  if (loading || !room) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700}>
            {room.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Chip
              label={`Piętro ${room.floor?.floor_number || 'N/A'}`}
              icon={<MeetingRoom />}
              size="small"
              variant="outlined"
            />
            <Chip
              label={room.home?.name || 'N/A'}
              icon={<Business />}
              size="small"
              variant="outlined"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              {wsStatus === 'connected' ? (
                <Wifi color="success" fontSize="small" />
              ) : (
                <WifiOff color="error" fontSize="small" />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {wsStatus.charAt(0).toUpperCase() + wsStatus.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Timeline />}
            sx={{ px: 3 }}
          >
            Analityka
          </Button>
          <Button
            variant="outlined"
            startIcon={<History />}
            sx={{ px: 3 }}
          >
            Historia
          </Button>
          <Tooltip title="Odśwież">
            <IconButton onClick={()=>fetchRoom()} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Ogólne" icon={<Sensors />} />
        <Tab label="Urządzenia" icon={<Lightbulb />} />
        <Tab label="Zużycie energii" icon={<EnergySavingsLeaf />} />
        <Tab label="Zasady" icon={<EventNote />} />
        <Tab label="Ustawienia" icon={<Settings />} />
      </Tabs>

      {/* Main Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatusCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', mr: 2 }}>
                    <Thermostat />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Temperature
                    </Typography>
                    <Typography variant="h4">
                      {room.temperature || 'N/A'}°C
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Setpoint: 22°C
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Humidity: {room.humidity || 'N/A'}%
                  </Typography>
                </Box>
              </CardContent>
            </StatusCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatusCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', mr: 2 }}>
                    <EnergySavingsLeaf />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Energy Usage Today
                    </Typography>
                    <Typography variant="h4">
                      {energyUsage.today} kWh
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Week: {energyUsage.week} kWh
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Month: {energyUsage.month} kWh
                  </Typography>
                </Box>
              </CardContent>
            </StatusCard>
          </Grid>

          {/* Devices Overview */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Aktywne urządzenia
            </Typography>
            <Grid container spacing={2}>
              {devices?.map((device)=> (
                <Grid item xs={12} sm={6} md={4} lg={3} key={device.device_id}>
                  <DeviceCard active={device.isActive}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {device.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last active: {new Date(device.lastUpdated).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Switch
                        checked={device.isActive}
                        onChange={() => handleDeviceToggle(device.device_id)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </DeviceCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              All Connected Devices
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={3}>
                {devices?.map(device => (
                  <Grid item xs={12} sm={6} md={4} key={device.device_id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{
                              bgcolor: device.isActive ? 'success.light' : 'grey.100',
                              color: device.isActive ? 'success.main' : 'grey.500'
                            }}>
                              {device.type === 'light' && <Lightbulb />}
                              {device.type === 'thermostat' && <Thermostat />}
                              {device.type === 'security' && <Lock />}
                              {device.type === 'sensor' && <Sensors />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {device.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {device.type}
                              </Typography>
                            </Box>
                          </Box>
                          <Switch
                            checked={device.isActive}
                            onChange={() => handleDeviceToggle(device.device_id)}
                            color="primary"
                          />
                        </Box>
                        {device.temp && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Current temperature: {device.temp}°C
                            </Typography>
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Last active: {new Date(device.lastUpdated).toLocaleDateString()}, {new Date(device.lastUpdated).toLocaleTimeString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Energy Consumption
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
            <Typography color="text.secondary">
              Energy analytics coming soon
            </Typography>
          </Paper>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Security Settings
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
            <Typography color="text.secondary">
              Security settings coming soon
            </Typography>
          </Paper>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Room Settings
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
            <Typography color="text.secondary">
              Room configuration coming soon
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RoomPage;