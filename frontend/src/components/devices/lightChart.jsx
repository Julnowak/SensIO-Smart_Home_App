import React from 'react';
import { BarChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';
import {Grid, Paper, Typography} from "@mui/material";

const LightUsageChart = ({ measurements }) => {
  const theme = useTheme();

  // Filtruj tylko pomiary światła (LIGHT) i konwertuj wartości na liczby
  const lightMeasurements = measurements
    .filter(m => m.sensor?.data_type === "LIGHT" && m.value !== undefined)
    .map(m => ({
      ...m,
      numericValue: parseInt(m.value),
      hour: new Date(m.created_at).getHours(),
      day: new Date(m.created_at).getDay(), // 0 (niedziela) - 6 (sobota)
      month: new Date(m.created_at).getMonth() // 0 (styczeń) - 11 (grudzień)
    }));

  // Funkcja pomocnicza do obliczania procentów
  const calculatePercentage = (data, groupBy) => {
    const groups = {};

    data.forEach(m => {
      const key = groupBy(m);
      if (!groups[key]) {
        groups[key] = { total: 0, on: 0 };
      }
      groups[key].total++;
      if (m.numericValue === 1) groups[key].on++;
    });

    return Object.entries(groups).map(([key, { total, on }]) => ({
      key,
      percentage: total > 0 ? Math.round((on / total) * 100) : 0
    }));
  };

  // Przygotowanie danych dla wykresów
  const hourlyData = calculatePercentage(lightMeasurements, m => m.hour)
    .sort((a, b) => parseInt(a.key) - parseInt(b.key))
    .map(item => ({
      hour: `${item.key}:00`,
      percentage: item.percentage
    }));

  const dailyData = calculatePercentage(lightMeasurements, m => m.day)
    .sort((a, b) => parseInt(a.key) - parseInt(b.key))
    .map(item => ({
      day: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][parseInt(item.key)],
      percentage: item.percentage
    }));

  const monthlyData = calculatePercentage(lightMeasurements, m => m.month)
    .sort((a, b) => parseInt(a.key) - parseInt(b.key))
    .map(item => ({
      month: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'][parseInt(item.key)],
      percentage: item.percentage
    }));

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Statystyki włączonych świateł
      </Typography>

      <Grid container spacing={3}>
        {/* Wykres godzinowy */}
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Godzinowe
            </Typography>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: hourlyData.map(item => item.hour),
                label: 'Godzina'
              }]}
              series={[{
                data: hourlyData.map(item => item.percentage),
                color: theme.palette.warning.main
              }]}
              yAxis={[{ label: 'Procent włączonych (%)' }]}
              height={300}
            />
          </Paper>
        </Grid>

        {/* Wykres tygodniowy */}
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Tygodniowe (dni)
            </Typography>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: dailyData.map(item => item.day),
                label: 'Dzień tygodnia'
              }]}
              series={[{
                data: dailyData.map(item => item.percentage),
                color: theme.palette.primary.main
              }]}
              yAxis={[{ label: 'Procent włączonych (%)' }]}
              height={300}
            />
          </Paper>
        </Grid>

        {/* Wykres miesięczny */}
        <Grid size={{xs: 12}}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Miesięczne
            </Typography>
            <BarChart
              xAxis={[{
                scaleType: 'band',
                data: monthlyData.map(item => item.month),
                label: 'Miesiąc'
              }]}
              series={[{
                data: monthlyData.map(item => item.percentage),
                color: theme.palette.success.main
              }]}
              yAxis={[{ label: 'Procent włączonych (%)' }]}
              height={400}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default LightUsageChart;