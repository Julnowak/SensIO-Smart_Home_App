import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  PieChart,
  BarChart,
  LineChart
} from '@mui/x-charts';
import {
  useDrawingArea,
} from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
  fontWeight: 'bold',
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

const AlarmStatistics = ({ stats, timeSeriesData }) => {
  const theme = useTheme();
  const [highlighted, setHighlighted] = useState('item');
  const [faded, setFaded] = useState('global');
  const [chartType, setChartType] = useState('pie');
  const [timeRange, setTimeRange] = useState('24h');
  const [activeFilter, setActiveFilter] = useState(['errors', 'warnings', 'info']);

  // Dane wykresu
  const chartData = [
    {
      id: 0,
      value: stats.errors,
      label: 'Krytyczne',
      color: theme.palette.error.main,
      icon: <ErrorIcon />
    },
    {
      id: 1,
      value: stats.warnings,
      label: 'Ostrzeżenia',
      color: theme.palette.warning.main,
      icon: <WarningIcon />
    },
    {
      id: 2,
      value: stats.info,
      label: 'Informacje',
      color: theme.palette.info.main,
      icon: <InfoIcon />
    },
  ];

  const filteredData = chartData.filter(item =>
    (item.label === 'Krytyczne' && activeFilter.includes('errors')) ||
    (item.label === 'Ostrzeżenia' && activeFilter.includes('warnings')) ||
    (item.label === 'Informacje' && activeFilter.includes('info'))
  );

  const totalAlarms = filteredData.reduce((sum, item) => sum + item.value, 0);

  // Konfiguracja podświetlania
  const highlightScope = {
    highlighted,
    faded,
  }

  // Obsługa filtrowania
  const handleFilterChange = (event, newFilters) => {
    setActiveFilter(newFilters);
  };

  // Dane dla wykresu czasowego
  const timeSeriesChartData = [
    {
      curve: "natural",
      data: timeSeriesData?.map(item => item.errors),
      label: 'Krytyczne',
      color: theme.palette.error.main,
    },
    {
      curve: "natural",
      data: timeSeriesData?.map(item => item.warnings),
      label: 'Ostrzeżenia',
      color: theme.palette.warning.main,
    },
    {
      curve: "natural",
      data: timeSeriesData?.map(item => item.info),
      label: 'Informacje',
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Nagłówek i kontrole */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newType) => newType && setChartType(newType)}
            size="small"
          >
            <ToggleButton value="pie" aria-label="Wykres kołowy">
              <Tooltip title="Wykres kołowy">
                <PieChartIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="bar" aria-label="Wykres słupkowy">
              <Tooltip title="Wykres słupkowy">
                <BarChartIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="line" aria-label="Wykres liniowy">
              <Tooltip title="Wykres trendów">
                <LineChartIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, newRange) => newRange && setTimeRange(newRange)}
            size="small"
          >
            <ToggleButton value="1h">1h</ToggleButton>
            <ToggleButton value="24h">24h</ToggleButton>
            <ToggleButton value="7d">7d</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Filtry">
            <IconButton onClick={() => setHighlighted(highlighted === 'item' ? 'none' : 'item')}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Panel główny */}
        <Grid size={{xs:12, md:8}}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
              {chartType === 'pie' && (
                <Box sx={{ height: 400, position: 'relative' }}>
                  <PieChart
                    series={[
                      {
                        data: filteredData,
                        innerRadius: 60,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope,
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -10,
                          color: 'gray'
                        },
                      },
                    ]}
                    slotProps={{
                        legend: { hidden: true }, // Ukrywamy domyślną legendę
                      }}
                    width={600}
                    height={400}
                    margin={{ right: 200 }}
                  >
                    <PieCenterLabel>{totalAlarms}</PieCenterLabel>
                  </PieChart>

                  <Box sx={{
                    position: 'absolute',
                    right: 20,
                    top: 50,
                    width: 200
                  }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Legenda
                    </Typography>
                    <List dense>
                      {chartData.map((item) => (
                        <ListItem
                          key={item.id}
                          sx={{
                            cursor: 'pointer',
                            opacity: activeFilter.includes(item.label === 'Krytyczne' ? 'errors' :
                                    item.label === 'Ostrzeżenia' ? 'warnings' : 'info') ? 1 : 0.5,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                          onClick={() => {
                            const filterKey = item.label === 'Krytyczne' ? 'errors' :
                                             item.label === 'Ostrzeżenia' ? 'warnings' : 'info';
                            if (activeFilter.includes(filterKey)) {
                              setActiveFilter(activeFilter.filter(f => f !== filterKey));
                            } else {
                              setActiveFilter([...activeFilter, filterKey]);
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${item.label}: ${item.value}`}
                            secondary={`${Math.round((item.value / totalAlarms) * 100)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}

              {chartType === 'bar' && (
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: filteredData.map(item => item.label),
                    label: 'Typ alarmu'
                  }]}
                  yAxis={[{
                    label: 'Liczba zdarzeń'
                  }]}
                  series={[
                    {
                      data: filteredData.map(item => item.value),
                      color: filteredData.map(item => item.color),
                      highlightScope,
                    },
                  ]}
                  width={600}
                  height={400}
                />
              )}

              {chartType === 'line' && (
                <LineChart
                  xAxis={[{
                    data: timeSeriesData.map((_, index) => index),
                    label: 'Czas',
                    valueFormatter: (value) => {
                      const date = new Date();
                      date.setHours(date.getHours() - (timeSeriesData.length - value - 1));
                      return date.toLocaleTimeString();
                    }
                  }]}
                  yAxis={[{
                    label: 'Liczba zdarzeń'
                  }]}
                  series={timeSeriesChartData.filter(series =>
                    (series.label === 'Krytyczne' && activeFilter.includes('errors')) ||
                    (series.label === 'Ostrzeżenia' && activeFilter.includes('warnings')) ||
                    (series.label === 'Informacje' && activeFilter.includes('info'))
                  )}
                  width={600}
                  height={400}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel podsumowania */}
        <Grid size={{xs:12, md:4}}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Podsumowanie
              </Typography>

              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 2
              }}>
                {chartData.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={2}
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${item.color}`,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.icon}
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h6">
                        {item.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {Math.round((item.value / totalAlarms) * 100)}% wszystkich zdarzeń
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ostatnia aktualizacja: {new Date().toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlarmStatistics;