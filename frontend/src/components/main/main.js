import React from 'react';
import {Grid, Paper, Typography, Box, useTheme} from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  Lightbulb as LightbulbIcon,
  Security as SecurityIcon,
  EnergySavingsLeaf as EnergyIcon,
  DeviceHub as DevicesIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';


// Proste komponenty wykresów zastępujące importowane
const DoughnutChart = ({ data }) => {
  const theme = useTheme();
  const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main, theme.palette.warning.main];

  // Oblicz kąty dla każdego wycinka
  const total = data.values.reduce((sum, value) => sum + value, 0);
  let cumulativePercent = 0;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {data.values.map((value, i) => {
          if (value === 0) return null;

          const percent = value / total;
          const startX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent);
          const startY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent);
          cumulativePercent += percent;
          const endX = 50 + 50 * Math.cos(2 * Math.PI * cumulativePercent);
          const endY = 50 + 50 * Math.sin(2 * Math.PI * cumulativePercent);

          const largeArcFlag = percent > 0.5 ? 1 : 0;

          return [
            <path
              key={`path-${i}`}
              d={`M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={colors[i % colors.length]}
            />,
            <text
              key={`text-${i}`}
              x={50 + 30 * Math.cos(2 * Math.PI * (cumulativePercent - percent / 2))}
              y={50 + 30 * Math.sin(2 * Math.PI * (cumulativePercent - percent / 2))}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="3"
            >
              {`${Math.round(percent * 100)}%`}
            </text>
          ];
        })}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="5"
          fontWeight="bold"
        >
          {total} kW
        </text>
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {data.labels.map((label, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              width: '10px',
              height: '10px',
              bgcolor: colors[i % colors.length],
              mr: 0.5
            }} />
            <Typography variant="caption">{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const LineChart = ({ data }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.values, 1);
  const minValue = Math.min(...data.values, 0);
  const range = maxValue - minValue;

  // Normalizuj wartości do zakresu 0-100 dla wysokości
  const normalizedValues = data.values.map(v => ((v - minValue) / range) * 100);

  return (
    <Box sx={{ height: '200px', position: 'relative' }}>
      <svg viewBox={`0 0 100 ${100 + 20}`} style={{ width: '100%', height: '100%' }}>
        {/* Linia wykresu */}
        <polyline
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth="2"
          points={normalizedValues.map((v, i) =>
            `${(i / (data.values.length - 1)) * 100},${100 - v}`
          ).join(' ')}
        />

        {/* Punkty na wykresie */}
        {normalizedValues.map((v, i) => (
          <circle
            key={i}
            cx={(i / (data.values.length - 1)) * 100}
            cy={100 - v}
            r="2"
            fill={theme.palette.primary.main}
          />
        ))}

        {/* Oś X - etykiety czasu */}
        {data.labels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={(i / (data.labels.length - 1)) * 100}
            y="115"
            textAnchor="middle"
            fontSize="3"
          >
            {label}
          </text>
        ))}

        {/* Oś Y - wartości */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={`y-${v}`}>
            <line
              x1="0"
              y1={100 - v}
              x2="100"
              y2={100 - v}
              stroke="#ddd"
              strokeWidth="0.5"
              strokeDasharray="1,2"
            />
            <text
              x="-5"
              y={100 - v + 2}
              textAnchor="end"
              fontSize="3"
            >
              {Math.round(minValue + (v / 100) * range)}°C
            </text>
          </g>
        ))}
      </svg>
    </Box>
  );
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
}));

const StatCard = ({ icon, title, value, subtitle }) => (
  <Item>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {React.cloneElement(icon, { fontSize: 'large', color: 'primary' })}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
      {value}
    </Typography>
    <Typography variant="caption" color="textSecondary">
      {subtitle}
    </Typography>
  </Item>
);


const Main = () => {
  // Przykładowe dane - w rzeczywistości pobierane z API
  const energyData = {
    labels: ['Oświetlenie', 'HVAC', 'Gniazdka', 'Inne'],
    values: [35, 45, 15, 5],
  };

  const temperatureTrend = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [20, 19, 21, 23, 22, 21],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Building Management System Dashboard
      </Typography>

      {/* Główne statystyki */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ThermostatIcon />}
            title="Temperatura"
            value="22.5°C"
            subtitle="Średnia w budynku"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EnergyIcon />}
            title="Energia"
            value="245 kW"
            subtitle="Zużycie dzienne"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DevicesIcon />}
            title="Urządzenia"
            value="87/92"
            subtitle="Aktywne/Total"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SecurityIcon />}
            title="Bezpieczeństwo"
            value="100%"
            subtitle="Systemy aktywne"
          />
        </Grid>
      </Grid>

      {/* Wykresy i główne informacje */}
      <Grid container spacing={3}>
        {/* Rozkład energii */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Rozkład zużycia energii
            </Typography>
            <DoughnutChart data={energyData} />
          </Item>
        </Grid>

        {/* Trend temperatury */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Trend temperatury (24h)
            </Typography>
            <LineChart data={temperatureTrend} />
          </Item>
        </Grid>

        {/* Alerty i powiadomienia */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Ostatnie alerty
            </Typography>
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                <Typography>⚠️ Wysoka temperatura w serwerowni</Typography>
                <Typography variant="caption">10 min temu</Typography>
              </Box>
              <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                <Typography>🔋 Niskie zużycie energii w strefie A</Typography>
                <Typography variant="caption">45 min temu</Typography>
              </Box>
              <Box sx={{ p: 1 }}>
                <Typography>🌡️ Awaria czujnika temperatury #12</Typography>
                <Typography variant="caption">2 godz. temu</Typography>
              </Box>
            </Box>
          </Item>
        </Grid>

        {/* Status oświetlenia */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Status oświetlenia
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <LightbulbIcon color="primary" />
                <Typography>Parter: 65%</Typography>
              </Grid>
              <Grid item xs={6}>
                <LightbulbIcon color="primary" />
                <Typography>I piętro: 42%</Typography>
              </Grid>
              <Grid item xs={6}>
                <LightbulbIcon color="primary" />
                <Typography>II piętro: 38%</Typography>
              </Grid>
              <Grid item xs={6}>
                <LightbulbIcon color="primary" />
                <Typography>Piwnica: 90%</Typography>
              </Grid>
            </Grid>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Średnie wykorzystanie: 58%
            </Typography>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Main;