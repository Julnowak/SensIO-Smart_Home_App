import React, { useState, useEffect } from "react";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import { useParams } from "react-router-dom";
import LayoutViewer from "../../layoutViewer/layoutViewer";
import EditableCanvas from "../../editableCanvas/editableCanvas";
import {
  Edit,
  EditOff,
  Home,
  LocationOn,
  Notes,
  Layers,
  Save,
  Cancel,
  Settings
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    useTheme, CircularProgress
} from "@mui/material";
import { styled } from "@mui/material/styles";

const BuildingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8]
  }
}));

const BuildingPage = () => {
  const [location, setLocation] = useState(null);
  const [layout, setLayout] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoom, setEditRoom] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFloor, setSelectedFloor] = useState(1);
  const theme = useTheme();

  const token = localStorage.getItem("access");
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get(API_BASE_URL + "home/" + params.id, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocation(response.data.homeData);
        setFormData(response.data.homeData);
        setLayout(response.data.roomsData);
        setSelectedFloor(response.data.homeData?.floor_num || 1);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchData();
  }, [params.id, token]);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/room_updates/${params.id}/`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLayout((prevLayout) =>
        prevLayout.map((room) =>
          room.room_id === data.room_id ? { ...room, light: data.light } : room
        )
      );
    };

    return () => ws.close();
  }, [params.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add API c/all to save changes here
  };

  if (!location) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BuildingCard elevation={3}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Building name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '2rem',
                    fontWeight: 700
                  }
                }}
              />
            ) : (
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                {formData.name}
              </Typography>
            )}

            <IconButton
              onClick={() => setIsEditing(!isEditing)}
              color={isEditing ? "error" : "primary"}
              sx={{
                border: `1px solid ${isEditing ? theme.palette.error.main : theme.palette.primary.main}`,
                borderRadius: 2,
                p: 1.5
              }}
            >
              {isEditing ? <Cancel /> : <Edit />}
            </IconButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {isEditing ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="regards"
                  value={formData.regards || ''}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Notes />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of floors"
                  name="floor_num"
                  type="number"
                  value={formData.floor_num || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Layers />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setIsEditing(false)}
                    startIcon={<Cancel />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<Save />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="action" />
                  <Typography variant="body1">
                    <strong>Address:</strong> {location.address || "Not specified"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Notes color="action" />
                  <Typography variant="body1">
                    <strong>Notes:</strong> {location.regards || "None"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Layers color="action" />
                  <Typography variant="body1">
                    <strong>Floors:</strong> {location.floor_num}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Home color="action" />
                  <Typography variant="body1">
                    <strong>Code:</strong> {location.code}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Building Layout
              </Typography>
              <Select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {Array.from({ length: location.floor_num }, (_, i) => i + 1).map(floor => (
                  <MenuItem key={floor} value={floor}>
                    Floor {floor}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <ToggleButtonGroup
              value={editRoom}
              exclusive
              onChange={() => setEditRoom(!editRoom)}
              aria-label="edit mode"
            >
              <ToggleButton value={false} selected={!editRoom}>
                <Settings sx={{ mr: 1 }} />
                View Mode
              </ToggleButton>
              <ToggleButton value={true} selected={editRoom} color="primary">
                <Edit sx={{ mr: 1 }} />
                Edit Mode
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
            {editRoom ? (
              <EditableCanvas layout={layout} floor_id={selectedFloor} />
            ) : (
              <LayoutViewer layout={layout} />
            )}
          </Paper>
        </Box>
      </BuildingCard>
    </Container>
  );
};

export default BuildingPage;