import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Chart from 'chart.js/auto';

interface BuildingEnergyData {
  day: string;
  buildings: {
    [key: string]: number;
  };
}

const StackedEnergyChart: React.FC = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const [timeRange, setTimeRange] = React.useState('week');

  // Przykładowe dane
  const energyData: BuildingEnergyData[] = [
    {
      day: 'Poniedziałek',
      buildings: {
        'Budynek A': 1200,
        'Budynek B': 800,
        'Budynek C': 600,
      }
    },
    {
      day: 'Wtorek',
      buildings: {
        'Budynek A': 1100,
        'Budynek B': 900,
        'Budynek C': 700,
      }
    },
    // ... więcej dni
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    const buildingNames = Object.keys(energyData[0].buildings);
    const days = energyData.map(item => item.day);

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: days,
        datasets: buildingNames.map((building, idx) => ({
          label: building,
          data: energyData.map(day => day.buildings[building]),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.error.main,
          ][idx % 3],
          borderColor: theme.palette.common.white,
          borderWidth: 1
        }))
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Zużycie energii (kWh)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                const datasetIndex = context[0].datasetIndex;
                const dataIndex = context[0].dataIndex;
                const total = energyData[dataIndex].buildings[buildingNames[0]] +
                              energyData[dataIndex].buildings[buildingNames[1]] +
                              energyData[dataIndex].buildings[buildingNames[2]];
                const value = context[0].raw;
                const percentage = ((value / total) * 100).toFixed(1);
                return `Udział: ${percentage}%`;
              }
            }
          },
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Skumulowane zużycie energii według budynków'
          }
        }
      }
    });

    return () => chart.destroy();
  }, [energyData, timeRange, theme]);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Rozkład zużycia energii
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Zakres</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Zakres"
          >
            <MenuItem value="week">Tydzień</MenuItem>
            <MenuItem value="month">Miesiąc</MenuItem>
            <MenuItem value="year">Rok</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: '400px', position: 'relative' }}>
        <canvas ref={chartRef} />
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: theme.palette.text.secondary }}>
        * Wartości przedstawiają procentowy udział w dziennym zużyciu
      </Typography>
    </Paper>
  );
};

export default StackedEnergyChart;