import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import StackedEnergyChart from "./stackedEnergyChart";

interface EnergyData {
  day: string;
  hour: string;
  value: number;
}

const EnergyDashboard: React.FC = () => {
  const theme = useTheme();

  // Przykładowe dane - zużycie energii w różnych godzinach
  const energyData: EnergyData[] = [
    { day: 'Monday', hour: '00', value: 1.2 },
    { day: 'Monday', hour: '06', value: 2.5 },
    { day: 'Monday', hour: '12', value: 4.8 },
    { day: 'Monday', hour: '18', value: 5.2 },
    { day: 'Tuesday', hour: '00', value: 1.1 },
    { day: 'Tuesday', hour: '06', value: 2.7 },
    { day: 'Tuesday', hour: '12', value: 4.9 },
    { day: 'Tuesday', hour: '18', value: 5.5 },
    { day: 'Wednesday', hour: '00', value: 1.3 },
    { day: 'Wednesday', hour: '06', value: 2.6 },
    { day: 'Wednesday', hour: '12', value: 5.0 },
    { day: 'Wednesday', hour: '18', value: 5.8 },
    { day: 'Thursday', hour: '00', value: 1.0 },
    { day: 'Thursday', hour: '06', value: 2.8 },
    { day: 'Thursday', hour: '12', value: 5.2 },
    { day: 'Thursday', hour: '18', value: 6.0 },
    { day: 'Friday', hour: '00', value: 1.4 },
    { day: 'Friday', hour: '06', value: 3.0 },
    { day: 'Friday', hour: '12', value: 5.5 },
    { day: 'Friday', hour: '18', value: 6.5 },
    { day: 'Saturday', hour: '00', value: 2.0 },
    { day: 'Saturday', hour: '06', value: 3.5 },
    { day: 'Saturday', hour: '12', value: 4.5 },
    { day: 'Saturday', hour: '18', value: 5.0 },
    { day: 'Sunday', hour: '00', value: 2.2 },
    { day: 'Sunday', hour: '06', value: 3.2 },
    { day: 'Sunday', hour: '12', value: 4.0 },
    { day: 'Sunday', hour: '18', value: 4.5 },
  ];

  // Formatowanie danych na tablicę 7x4 (dni x godziny)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = ['00', '06', '12', '18'];

  const getColor = (value: number) => {
    const maxValue = 7;
    const intensity = Math.min(value / maxValue, 1);
    const red = Math.floor(255 * intensity);
    const green = Math.floor(255 * (1 - intensity));
    return `rgb(${red}, ${green}, 50)`;
  };

  // Komponent komórki heatmapy
  const HeatMapCell = styled(Paper)(({ value }: { value: number }) => ({
    width: '100%',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor(value),
    color: value > 3.5 ? theme.palette.common.white : theme.palette.common.black,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      zIndex: 1
    }
  }));

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Energy Consumption Dashboard
      </Typography>

      {/* Nagłówki godzin */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={3} />
        {hours.map((hour) => (
          <Grid item xs={2} key={`header-${hour}`}>
            <Typography variant="subtitle2" align="center">
              {hour}:00
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Heatmapa */}
      {days.map((day) => (
        <Grid container spacing={1} key={day} sx={{ mb: 1 }}>
          <Grid item xs={3}>
            <Typography variant="body2">{day}</Typography>
          </Grid>
          {hours.map((hour) => {
            const dataPoint = energyData.find(d => d.day === day && d.hour === hour);
            const value = dataPoint?.value || 0;
            return (
              <Grid item xs={2} key={`${day}-${hour}`}>
                <HeatMapCell value={value} elevation={2}>
                  <Typography variant="caption">{value.toFixed(1)}</Typography>
                </HeatMapCell>
              </Grid>
            );
          })}
        </Grid>
      ))}

      {/* Legenda */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ mr: 2 }}>Low</Typography>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => (
          <Box
            key={`legend-${val}`}
            sx={{
              width: 24,
              height: 24,
              backgroundColor: getColor(val),
              mx: 0.5
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 2 }}>High</Typography>
      </Box>

        <StackedEnergyChart/>
    </Box>
  );
};

export default EnergyDashboard;