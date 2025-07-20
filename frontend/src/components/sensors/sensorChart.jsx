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

      // Podziel pomiary na różne typy
      const normalMeasurements = measurements
      const warningMeasurements = measurements.filter(m => m.warning && m.warning !== "NORMAL");

      // Dataset dla normalnych wartości (niebieska linia)
      const normalDataset = {
        label: 'Normalne wartości',
        data: normalMeasurements.map(m => ({
          x: new Date(m.created_at).toLocaleString(),
          y: m.value
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2
      };

      // Grupuj pomiary ostrzegawcze według typu
      const warningGroups = {
        LOW: warningMeasurements.filter(m => m.warning === "LOW"),
        MEDIUM: warningMeasurements.filter(m => m.warning === "MEDIUM"),
        HIGH: warningMeasurements.filter(m => m.warning === "HIGH")
      };

      // Kolory dla różnych typów ostrzeżeń
      const warningColors = {
        LOW: 'yellow',
        MEDIUM: 'orange',
        HIGH: 'red'
      };

      // Tworzenie datasetów dla każdego typu ostrzeżenia
      const warningDatasets = Object.entries(warningGroups).map(([type, measurements]) => {
        if (measurements.length === 0) return null;

        return {
          label: `Ostrzeżenie: ${type.toLowerCase()}`,
          data: measurements.map(m => ({
            x: new Date(m.created_at).toLocaleString(),
            y: m.value
          })),
          backgroundColor: warningColors[type],
          borderColor: warningColors[type],
          pointRadius: 5,
          pointHoverRadius: 7,
          showLine: false,
          borderWidth: 0
        };
      }).filter(Boolean);

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [normalDataset, ...warningDatasets]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value}`;
                }
              }
            }
          },
          scales: {
            x: {
              type: 'category',
              labels: measurements.map(m => new Date(m.created_at).toLocaleString()),
            },
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
          <Typography>Brak danych do wyświetlenia</Typography>
    );
  }

  return (
    <Box sx={{ height: '400px' }}>
      <canvas ref={chartRef} />
    </Box>
  );
};

export default SensorChart;