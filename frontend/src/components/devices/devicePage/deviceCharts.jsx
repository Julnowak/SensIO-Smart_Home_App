import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const deviceColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE',
  '#00C49F', '#FFBB28', '#FF8042', '#8884d8'
];

const DeviceCharts = ({sensors, measurements}) => {
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [chartType, setChartType] = useState('ENERGY');

  const chartData = useMemo(() => {
    const groupedByTime = measurements.reduce((acc, measurement) => {
      const time = measurement.created_at;
      if (!acc[time]) {
        acc[time] = { time };
      }

      if (measurement.sensor.data_type === chartType) {
        const sensorId = measurement.sensor.sensor_id;
        acc[time][`${sensorId}`] = parseFloat(measurement.value);
      }

      return acc;
    }, {});

    return Object.values(groupedByTime)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [measurements, chartType]);

  const handleDeviceChange = (event) => {
    const value = event.target.value;
    if (value.length <= 5) {
      setSelectedSensors(value);
    }
  };

  const availableSensors = useMemo(() =>
    sensors.filter(sensor =>
      measurements.some(m => m.sensor.sensor_id === sensor.sensor_id && m.sensor.data_type === chartType)
    ),
    [sensors, measurements, chartType]
  );

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Monitorowanie Urządzeń
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Panel wyboru urządzeń */}
        <Grid size={{xs:12, md:4}}>
          <FormControl fullWidth>
            <InputLabel id="devices-select-label">Wybierz urządzenia (max 5)</InputLabel>
            <Select
              labelId="devices-select-label"
              id="devices-select"
              multiple
              value={selectedSensors}
              onChange={handleDeviceChange}
              input={<OutlinedInput label="Wybierz urządzenia (max 5)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((sensorId) => {
                    const sensor = sensors.find(s => s.sensor_id === sensorId);
                    return (
                      <Chip
                        key={sensorId}
                        label={sensor?.visibleName}
                        sx={{
                          backgroundColor: deviceColors[sensors.findIndex(d => d.sensor_id === sensorId) % deviceColors.length],
                          color: 'white'
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {availableSensors.map((s) => (
                <MenuItem key={s.sensor_id} value={s.sensor_id}>
                  <Checkbox checked={selectedSensors.indexOf(s.sensor_id) > -1} />
                  <ListItemText primary={s.visibleName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Typ wykresu:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                label="Energia"
                onClick={() => setChartType('ENERGY')}
                color={chartType === 'ENERGY' ? 'primary' : 'default'}
                variant={chartType === 'ENERGY' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Temperatura"
                onClick={() => setChartType('TEMPERATURE')}
                color={chartType === 'TEMPERATURE' ? 'primary' : 'default'}
                variant={chartType === 'TEMPERATURE' ? 'filled' : 'outlined'}
              />
              <Chip
                label="Wilgotność"
                onClick={() => setChartType('HUMIDITY')}
                color={chartType === 'HUMIDITY' ? 'primary' : 'default'}
                variant={chartType === 'HUMIDITY' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Wybrane urządzenia:
            </Typography>
            {selectedSensors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Brak wybranych urządzeń
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedSensors.map((sensorId) => {
                  const sensor = sensors.find(s => s.sensor_id === sensorId);
                  const color = deviceColors[sensors.findIndex(s => s.sensor_id === sensorId) % deviceColors.length];
                  return (
                    <Chip
                      key={sensorId}
                      label={sensor.visibleName}
                      onDelete={() => {
                        setSelectedSensors(selectedSensors.filter(id => id !== sensorId));
                      }}
                      sx={{
                        backgroundColor: color,
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{xs:12, md:8}}>
          <Typography variant="h6" gutterBottom>
            {chartType === 'ENERGY' ? 'Zużycie energii urządzeń (kWh)' : (chartType === 'TEMPERATURE' ?'Temperatura urządzeń (°C)': "Wilgotność (%)")}
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              />
              <YAxis
                label={{
                  value: chartType === 'ENERGY' ? 'kWh' : (chartType === 'TEMPERATURE' ? '°C': '%'),
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const sensor = sensors.find(s => s.sensor_id === parseInt(name));
                  const unit = chartType === 'ENERGY' ? 'kWh' : (chartType === 'TEMPERATURE' ? '°C': '%');
                  return [`${value} ${unit}`, sensor?.visibleName];
                }}
                labelFormatter={(time) => `Czas: ${new Date(time).toLocaleTimeString()}`}
              />
              <Legend
                formatter={(sensorId) => {
                  const sensor = sensors.find(s => s.sensor_id === parseInt(sensorId));
                  return sensor?.visibleName || sensorId;
                }}
              />

              {selectedSensors.map((sensorId, index) => (
                <Line
                  key={sensorId}
                  type="monotone"
                  dataKey={sensorId}
                  name={sensorId.toString()}
                  stroke={deviceColors[index % deviceColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DeviceCharts;