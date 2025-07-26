import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnergyCharts = ({ measurements }) => {
  const energyMeasurements = measurements.filter(
    m => m.sensor?.data_type === "ENERGY"
  );

  const preparePieData = () => {
    const locationMap = {};

    energyMeasurements.forEach(m => {
      const locationName = m.sensor?.device?.location?.name || 'Brak lokalizacji';
      if (!locationMap[locationName]) {
        locationMap[locationName] = 0;
      }
      locationMap[locationName] += parseFloat(m.value);
    });

    return Object.entries(locationMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const prepareBarData = () => {
    const locationDeviceMap = {};

    energyMeasurements.forEach(m => {
      const locationName = m.sensor?.device?.location?.name || 'Brak lokalizacji';
      const deviceName = m.sensor?.device?.name || 'Brak urządzenia';

      if (!locationDeviceMap[locationName]) {
        locationDeviceMap[locationName] = {};
      }

      if (!locationDeviceMap[locationName][deviceName]) {
        locationDeviceMap[locationName][deviceName] = 0;
      }

      locationDeviceMap[locationName][deviceName] += parseFloat(m.value);
    });

    return Object.entries(locationDeviceMap).map(([location, devices]) => {
      const entry = { location };
      Object.entries(devices).forEach(([device, value]) => {
        entry[device] = parseFloat(value.toFixed(2));
      });
      return entry;
    });
  };

  const pieData = preparePieData();
  const barData = prepareBarData();

  // Kolory dla wykresów
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Pobierz unikalne nazwy urządzeń dla legendy
  const deviceNames = [...new Set(
    energyMeasurements.map(m => m.sensor?.device?.name || 'Brak urządzenia')
  )];

  return (

      <>
        <Grid size={{xs: 12, sm: 6}} >
          <Paper elevation={3} sx={{ p: 2, height: '100%', mt:2, mr:1  }}>
            <Typography variant="h6" align="center" gutterBottom>
              Zużycie energii według lokalizacji
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} kWh`, 'Zużycie']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, sm: 6}}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', mt:2, ml:1 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Zużycie energii per urządzenie
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={barData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={70} />
                <YAxis
                  label={{
                    value: 'Zużycie energii (kWh)',
                    angle: -90,
                    position: 'insideLeft'
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kWh`, 'Zużycie']}
                />
                <Legend />
                {deviceNames.map((device, index) => (
                  <Bar
                    key={device}
                    dataKey={device}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={device}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </>
  );
};

export default EnergyCharts;