import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  useTheme, Grid, CircularProgress, Container, Switch, FormControlLabel
} from "@mui/material";
import {
  Memory as MemoryIcon,
  Home as HomeIcon,
  QrCode as QrCodeIcon,
  Info as InfoIcon,
  Factory as FactoryIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon, RestartAlt
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const DeviceCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const InfoListItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiListItemAvatar-root': {
    minWidth: 40
  }
}));

const DevicePage = () => {
  const [device, setDevice] = useState({});
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const token = localStorage.getItem("access");
  const theme = useTheme();

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true);
        const response = await client.get(API_BASE_URL + `device/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDevice(response.data);
      } catch (error) {
        console.error("Failed to fetch device", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDevice();
    }
  }, [params.id, token]);

  const handleActiveChange = async (e) => {
    const response = await client.post(API_BASE_URL + `device/${params.id}/`,
    {},{
      headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
  };

  const getRoomColor = (roomName) => {
    const room = availableRooms.find(r => r.name === roomName);
    return room ? room.color : theme.palette.primary.main;
  };

  const availableRooms = [
    { name: "Salon", color: theme.palette.error.main },
    { name: "Biuro", color: theme.palette.success.main },
    { name: "Sypialnia", color: theme.palette.info.main },
    { name: "Kuchnia", color: theme.palette.warning.main }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/myDevices"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Powrót
        </Button>
        <Box sx={{ display: 'flex', textAlign: 'right', gap: 2,}}>
          <FormControlLabel control={<Switch value={device.isActive} onChange={handleActiveChange} color="success"/>} label="Aktywne" />
        </Box>
      </Box>

      <DeviceCard sx={{margin: "auto"}}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: "right", textAlign: 'right', gap: 2,}}>
              <Typography><b>Ostatnio aktywny:</b><br/> 5 minut temu</Typography>
            </Box>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: getRoomColor(device.room),
                mb: 2,
                mx: 'auto'
              }}
            >
              <MemoryIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              {device.name}
            </Typography>
            <Box>
              <Chip
                label={device.room || "Not assigned"}
                color="primary"
                sx={{
                  backgroundColor: getRoomColor(device.room),
                  color: theme.palette.getContrastText(getRoomColor(device.room)),
                  fontWeight: 'bold',
                  mr: 0.5
                }}
              />
              <Chip label="Online"
                    sx={{
                      color: theme.palette.getContrastText(getRoomColor(device.room)),
                      fontWeight: 'bold',
                      ml: 0.5
                    }}
                    color="success" />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <List>
            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                  <MemoryIcon sx={{ color: theme.palette.primary.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Temat"
                secondary={device.topic || "N/A"}
                secondaryTypographyProps={{ variant: "body1" }}
              />
            </InfoListItem>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                      <FactoryIcon sx={{ color: theme.palette.warning.contrastText }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Marka"
                    secondary={device.brand || "Nieznana"}
                    secondaryTypographyProps={{ variant: "body1" }}
                  />
                </InfoListItem>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                      <QrCodeIcon sx={{ color: theme.palette.secondary.contrastText }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Nr. seryjny"
                    secondary={device.serial_number || "Nieznana"}
                    secondaryTypographyProps={{ variant: "body1" }}
                  />
                </InfoListItem>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                      <FactoryIcon sx={{ color: theme.palette.warning.contrastText }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Marka"
                    secondary={device.brand || "Nieznana"}
                    secondaryTypographyProps={{ variant: "body1" }}
                  />
                </InfoListItem>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                      <QrCodeIcon sx={{ color: theme.palette.secondary.contrastText }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Nr. seryjny"
                    secondary={device.serial_number || "Nieznana"}
                    secondaryTypographyProps={{ variant: "body1" }}
                  />
                </InfoListItem>
              </Grid>
            </Grid>

            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.info.light, mr: 2 }}>
                  <InfoIcon sx={{ color: theme.palette.info.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Szczegóły"
                secondary={device.info || "Nie dodano żadnych dodatkowych informacji."}
                secondaryTypographyProps={{ variant: "body1", sx: { whiteSpace: 'pre-line' } }}
              />
            </InfoListItem>
          </List>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<RestartAlt />}
                    sx={{ borderRadius: 2, mx: 1 }}
            >
              Restart
            </Button>

            <Button
              component={Link}
              to={`/device/${params.id}/settings`}
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              sx={{ borderRadius: 2 }}
            >
              Edytuj
            </Button>
          </Box>
        </CardContent>
      </DeviceCard>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Logi urządzenia
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="Online" color="success" />
              <Typography>Last active: 5 minutes ago</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

    </Container>
  );
};

export default DevicePage;