import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Select,
  MenuItem,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import {
  Thermostat,
  Opacity,
  Lightbulb,
  Air,
  ShowChart,
  PieChart
} from "@mui/icons-material";
import { Chart, registerables } from "chart.js";
import { styled } from "@mui/material/styles";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {da} from "date-fns/locale";

Chart.register(...registerables);

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const ChartContainer = styled(Box)({
  position: 'relative',
  height: '300px',
  width: '100%'
});

const ChartComponent = ({ type, data, options }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          ...options
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={chartRef} />;
};

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState('Living Room');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data generator
  const generateTimeData = (count, min, max) => {
    const data = [];
    let lastValue = (min + max) / 2; // Start with midpoint

    for (let i = 0; i < count; i++) {
      // Create more natural-looking data with some randomness
      const randomChange = (Math.random() - 0.5) * (max - min) * 0.2;
      lastValue = Math.min(max, Math.max(min, lastValue + randomChange));
      data.push(parseFloat(lastValue.toFixed(1)));
    }

    return data;
  };

  const token = localStorage.getItem("access");
  const [num, setNum] = useState(0);
  const [temperatureData, setTemperatureData] = useState([]);

  const fetchNum = async () => {
    try {
      const response = await client.get(API_BASE_URL + "test/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNum(response.data.num);
    } catch (error) {
      console.error("Error fetching number:", error);
    }
  };

  // useEffect(() => {
  //   // ustaw interwał do cyklicznego pobierania
  //   const intervalId = setInterval(fetchNum, 5000); // co 5 sekund
  //
  //   // opcjonalnie: pobierz od razu przy starcie
  //   fetchNum();
  //
  //   // wyczyść interwał przy odmontowaniu komponentu
  //   return () => clearInterval(intervalId);
  // }, []);

useEffect(() => {
  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chart_updates/12/3/`);

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "sensor_update") {
        const sensorData = message.data;
        const tempSensor = sensorData.filter((d) => d.sensor === 6);
        setTemperatureData({
          labels: tempSensor.map((td) => new Date(td.created_at).toLocaleDateString()),
          datasets: [{
            label: 'Temperature (°C)',
            data: tempSensor.map((td) => parseFloat(td.value)),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true
          }]
        })
      }
    } catch (error) {
      console.error("❌ Błąd przy przetwarzaniu wiadomości WebSocket:", error);
    }
  };

  ws.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
  };

  return () => {
    ws.close();
  };
}, []);




  const locations = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom'];
  const timeRanges = ['12h', '24h', '7d', '30d'];

  // Chart data
  // const temperatureData = {
  //   labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  //   datasets: [{
  //     label: 'Temperature (°C)',
  //     data: generateTimeData(24, 18, 28),
  //     borderColor: '#FF6384',
  //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
  //     tension: 0.4,
  //     fill: true
  //   }]
  // };

  const humidityData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Humidity (%)',
      data: generateTimeData(24, 30, 70),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const lightData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Light Intensity (lux)',
      data: generateTimeData(24, 0, 1000),
      borderColor: '#FFCE56',
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const energyPredictionData = {
    labels: ['Current', 'Predicted'],
    datasets: [{
      label: 'Energy Usage (kWh)',
      data: [120, 145],
      backgroundColor: ['#4BC0C0', '#9966FF'],
      borderWidth: 1
    }]
  };

  const airQualityData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Air Quality Index',
      data: generateTimeData(24, 0, 100),
      borderColor: '#9966FF',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const energyUsageData = {
    labels: locations,
    datasets: [{
      label: 'Energy Usage (kWh)',
      data: [120, 90, 75, 50],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Wykresy i analityka
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Wszystkie istotne dane z Twoich czujników w jednym miejscu.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {locations.map(location => (
              <MenuItem key={location} value={location}>{location}</MenuItem>
            ))}
          </Select>

          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {timeRanges.map(range => (
              <MenuItem key={range} value={range}>{range}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={80} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Temperature Card */}
          <Grid item xs={12} md={6} lg={4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Thermostat color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Temperature Analysis</Typography>
                  <Chip label="Live" color="success" size="small" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="line"
                    data={temperatureData}

                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Humidity Card */}
          <Grid item xs={12} md={6} lg={4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Opacity color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Humidity Levels</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="line"
                    data={humidityData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: 20,
                          max: 80
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Light Card */}
          <Grid item xs={12} md={6} lg={4}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Lightbulb color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Light Intensity</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="line"
                    data={lightData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1200
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Energy Prediction Card */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ShowChart color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Energy Consumption Prediction</Typography>
                  <Chip label="AI Prediction" color="primary" size="small" sx={{ ml: 'auto' }} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="bar"
                    data={energyPredictionData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Air Quality Card */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Air color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Air Quality Index</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="line"
                    data={airQualityData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Energy Usage Card */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChart sx={{ fontSize: 40, mr: 2, color: '#4BC0C0' }} />
                  <Typography variant="h6">Energy Usage by Location</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <ChartContainer>
                  <ChartComponent
                    type="pie"
                    data={energyUsageData}
                  />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;