import React, { useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart } from 'chart.js/auto';

const SensorChart = ({ measurements }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!measurements || measurements.length === 0) return;

    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: measurements.map(m => new Date(m.created_at).toLocaleString()),
          datasets: [{
            label: 'Wartości pomiarów',
            data: measurements.map(m => m.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => `Wartość: ${context.parsed.y}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [measurements]);

  if (!measurements || measurements.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography>Brak danych do wyświetlenia</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wykres pomiarów
        </Typography>
        <Box sx={{ height: '400px' }}>
          <canvas ref={chartRef} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SensorChart;