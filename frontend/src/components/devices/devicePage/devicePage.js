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
    useTheme, Grid, CircularProgress, Container
} from "@mui/material";
import {
  Memory as MemoryIcon,
  Home as HomeIcon,
  QrCode as QrCodeIcon,
  Info as InfoIcon,
  Factory as FactoryIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon
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
          Back to Devices
        </Button>
        <Button
          component={Link}
          to={`/device/${params.id}/edit`}
          startIcon={<SettingsIcon />}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          Edit Device
        </Button>
      </Box>

      <DeviceCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
            <Chip
              label={device.room || "Not assigned"}
              color="primary"
              sx={{
                backgroundColor: getRoomColor(device.room),
                color: theme.palette.getContrastText(getRoomColor(device.room)),
                fontWeight: 'bold'
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <List>
            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  <MemoryIcon sx={{ color: theme.palette.primary.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Topic"
                secondary={device.topic || "N/A"}
                secondaryTypographyProps={{ variant: "body1" }}
              />
            </InfoListItem>

            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.secondary.light }}>
                  <QrCodeIcon sx={{ color: theme.palette.secondary.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Serial Number"
                secondary={device.serial_number || "Unknown"}
                secondaryTypographyProps={{ variant: "body1" }}
              />
            </InfoListItem>

            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                  <FactoryIcon sx={{ color: theme.palette.warning.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Brand"
                secondary={device.brand || "Unknown"}
                secondaryTypographyProps={{ variant: "body1" }}
              />
            </InfoListItem>

            <InfoListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                  <InfoIcon sx={{ color: theme.palette.info.contrastText }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Additional Info"
                secondary={device.info || "No additional information available"}
                secondaryTypographyProps={{ variant: "body1", sx: { whiteSpace: 'pre-line' } }}
              />
            </InfoListItem>
          </List>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              component={Link}
              to={`/device/${params.id}/settings`}
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              sx={{ borderRadius: 2 }}
            >
              Device Settings
            </Button>
          </Box>
        </CardContent>
      </DeviceCard>

      {/* Status and Statistics Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Device Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="Online" color="success" />
              <Typography>Last active: 5 minutes ago</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined">Restart</Button>
              <Button variant="outlined" color="error">
                Disable
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DevicePage;