import client from "../../client";
import { API_BASE_URL } from "../../config";
import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
  Button,
  Avatar,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab
} from '@mui/material';
import {
  LightbulbOutlined,
  OpacityOutlined,
  SettingsInputComponentOutlined,
  ShowChartOutlined,
  BubbleChartOutlined,
  MoreHorizOutlined,
  RefreshOutlined,
  InfoOutlined,
  ArrowBack as ArrowBackIcon,
  Memory as MemoryIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarTodayIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import SensorChart from "./sensorChart";


const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6]
  },
  borderRadius: 16
}));

const SensorPage = () => {
  const [sensor, setSensor] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('chart');
  const [timeRange, setTimeRange] = useState('24h');
  const params = useParams();
  const token = localStorage.getItem("access");
  const theme = useTheme();

  
  const fetchData = async () => {
      setLoading(true);
      try {
        // Pobierz dane czujnika
        const response = await client.get(`${API_BASE_URL}sensor/${params.id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSensor(response.data.sensorData);
        setMeasurements(response.data.measurementData);
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [params.id, token]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const getDataTypeIcon = (type) => {
    switch (type) {
      case 'LIGHT':
        return <LightbulbOutlined color="warning" />;
      case 'HUMIDITY':
        return <OpacityOutlined color="info" />;
      case 'CONTINUOUS':
        return <ShowChartOutlined color="success" />;
      case 'DISCRETE':
        return <BubbleChartOutlined color="secondary" />;
      case 'FUNCTIONAL':
        return <SettingsInputComponentOutlined color="action" />;
      default:
        return <MoreHorizOutlined color="disabled" />;
    }
  };

  const getDataTypeLabel = (type) => {
    const labels = {
      'LIGHT': 'Światło',
      'HUMIDITY': 'Wilgotność',
      'CONTINUOUS': 'Ciągły',
      'DISCRETE': 'Dyskretny',
      'FUNCTIONAL': 'Funkcyjny',
      'OTHER': 'Inny'
    };
    return labels[type] || type;
  };

  if (!sensor && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          component={Link}
          onClick={()=>window.history.go(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Powrót
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Odśwież dane">
            <IconButton onClick={()=> fetchData()} color="primary" disabled={loading}>
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{
                  bgcolor: theme.palette.primary.main,
                  mr: 2,
                  width: 56,
                  height: 56
                }}>
                  {getDataTypeIcon(sensor?.data_type)}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1">
                    {sensor?.visibleName || sensor?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {getDataTypeLabel(sensor?.data_type)} • {sensor?.device?.name}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Pokój
                  </Typography>
                  <Typography variant="body1">
                    {sensor?.room?.name || 'Nie przypisano'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nr seryjny
                  </Typography>
                  <Typography variant="body1">
                    {sensor?.serial_number || 'Nieznany'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Typ danych
                  </Typography>
                  <Typography variant="body1">
                    {getDataTypeLabel(sensor?.data_type)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Jednostka
                  </Typography>
                  <Typography variant="body1">
                    {sensor?.unit || 'brak'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Ostatni odczyt
              </Typography>
              {measurements.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h3" sx={{ mr: 1 }}>
                      {Math.round(measurements[0].value*100)/100}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                      {sensor?.unit}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(measurements[0].created_at), 'PPpp', { locale: pl })}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    ({formatDistance(new Date(measurements[0].created_at), new Date(), { addSuffix: true, locale: pl })})
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Brak danych pomiarowych
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="Wykres" value="chart" icon={<ShowChartIcon />} />
          <Tab label="Tabela" value="table" icon={<TableChartIcon />} />
        </Tabs>
      </Paper>

      {activeTab === 'chart' && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Historia pomiarów
              </Typography>
              <Tabs
                value={timeRange}
                onChange={handleTimeRangeChange}
                variant="scrollable"
                scrollButtons="auto"
                size="small"
              >
                <Tab label="24h" value="24h" />
                <Tab label="7 dni" value="7d" />
                <Tab label="30 dni" value="30d" />
                <Tab label="Wszystkie" value="all" />
              </Tabs>


            </Box>
            {measurements && <SensorChart measurements={measurements} />}
          </CardContent>
        </StyledCard>
      )}

      {activeTab === 'table' && (
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tabela pomiarów
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Wartość</TableCell>
                    <TableCell>Data pomiaru</TableCell>
                    <TableCell>Zapisano</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Skeleton height={40} />
                      </TableCell>
                    </TableRow>
                  ) : measurements.length > 0 ? (
                    measurements
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((measurement) => (
                        <TableRow key={measurement.measurement_id}>
                          <TableCell>
                            {Math.round(measurement.value*100)/100} {sensor?.unit}
                          </TableCell>
                          <TableCell>
                            {format(new Date(measurement.created_at), 'PPpp', { locale: pl })}
                          </TableCell>
                          <TableCell>
                            {formatDistance(new Date(measurement.saved_at), new Date(), { addSuffix: true, locale: pl })}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body1" color="text.secondary">
                          Brak danych pomiarowych
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={measurements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Wierszy na stronę:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
            />
          </CardContent>
        </StyledCard>
      )}
    </Box>
  );
};

export default SensorPage;