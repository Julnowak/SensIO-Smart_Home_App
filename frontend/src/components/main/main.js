import React, { useState, useEffect } from 'react';
import { isUserAuthenticated } from "../../AuthContext";
import { Navigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Grid,
  Container,
  Typography,
  Switch,
  styled,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { PieChart } from '@mui/x-charts';
import {
  Thermostat,
  WaterDrop,
  LightMode,
  Lightbulb
} from '@mui/icons-material';
import Droplet from "../graphical_elements/droplet";
import EditableCanvas from "../editableCanvas/editableCanvas";

// Dark theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

const sensorsMockData = [
  { id: 1, type: "Temperature", value: 22.5, unit: "°C", icon: <Thermostat fontSize="large" /> },
  { id: 2, type: "Humidity", value: 55, unit: "%", icon: <WaterDrop fontSize="large" /> },
  { id: 3, type: "Light", value: 300, unit: "lx", icon: <LightMode fontSize="large" /> },
];

const ModernCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

const Main = () => {
  const [sensors, setSensors] = useState(sensorsMockData);
  const [ledState, setLedState] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => ({
          ...sensor,
          value: sensor.value + (Math.random() - 0.5) * 2,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isUserAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          fontWeight: 700,
          textAlign: 'center',
          mb: 6,
          color: 'primary.main'
        }}>
          Sensor Management Dashboard
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {sensors.map((sensor) => (
            <Grid item key={sensor.id} xs={12} md={6} lg={4}>
              <ModernCard>
                <CardContent sx={{ p: 3 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item sx={{ color: 'secondary.main' }}>
                      {sensor.icon}
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" color="textSecondary">
                        {sensor.type}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {sensor.value.toFixed(1)}
                        <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                          {sensor.unit}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </ModernCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Droplet fillPercentage={60} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ModernCard>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Grid container alignItems="center" justifyContent="center" spacing={2}>
                  <Grid item>
                    <Lightbulb sx={{
                      fontSize: 40,
                      color: ledState ? 'warning.main' : 'text.disabled',
                      verticalAlign: 'middle'
                    }} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" component="div">
                      LED Control
                      <Switch
                        checked={ledState}
                        onChange={(e) => setLedState(e.target.checked)}
                        sx={{
                          ml: 2,
                          '& .MuiSwitch-thumb': {
                            backgroundColor: ledState ? theme.palette.warning.main : '#fff',
                          },
                          '& .MuiSwitch-track': {
                            backgroundColor: ledState ? theme.palette.warning.dark : '#666',
                          },
                        }}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </ModernCard>
          </Grid>
        </Grid>

        {/* Add PieChart and EditableCanvas components here */}
      </Container>
    </ThemeProvider>
  );
};

export default Main;