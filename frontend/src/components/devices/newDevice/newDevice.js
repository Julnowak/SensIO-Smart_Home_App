import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
  Paper,
  MenuItem
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Devices as DevicesIcon,
  QrCode as QrCodeIcon,
  Room as RoomIcon,
  BrandingWatermark as BrandIcon, CheckCircle
} from "@mui/icons-material";

const NewDevice = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const [deviceData, setDeviceData] = useState({
    name: "",
    serial_number: "",
    topic: "",
    info: "",
    brand: "",
    room: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deviceTypes = [
    "Light",
    "Thermostat",
    "Sensor",
    "Camera",
    "Speaker",
    "Other"
  ];

  const handleChange = (e) => {
    setDeviceData({ ...deviceData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await client.post(
        API_BASE_URL + "device/",
        deviceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/devices"), 2000);
    } catch (err) {
      console.error("Error adding device:", err);
      setError(err.response?.data?.message || "Failed to add device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
      <Card sx={{
        width: "100%",
        maxWidth: 800,
        borderRadius: 3,
        boxShadow: 3
      }}>
        <CardContent>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            gap: 2
          }}>
            <DevicesIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h4" component="h1">
              Add New Device
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Device Name *"
                  name="name"
                  value={deviceData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DevicesIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serial_number"
                  value={deviceData.serial_number}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topic"
                  name="topic"
                  value={deviceData.topic}
                  onChange={handleChange}
                  helperText="MQTT topic for device communication"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={deviceData.brand}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BrandIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Room"
                  name="room"
                  value={deviceData.room}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RoomIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Info"
                  name="info"
                  value={deviceData.info}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate("/devices")}
                    color="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Device"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
          icon={<CheckCircle fontSize="inherit" />}
        >
          Device added successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewDevice;