import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Tooltip,
  IconButton,
  InputAdornment,
  Chip,
  Typography,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const ActionFilters = ({ filters, setFilters, handleFilter, handleRefresh, handleExport, logs, setFilteredLogs }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <FilterIcon color="primary" sx={{ mr: 1 }} />
        Filtruj akcje
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2} alignItems="center">
        {/* Wyszukiwarka */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Szukaj w opisach..."
            value={filters.search}
            onChange={e => setFilters({...filters, search: e.target.value})}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Typ akcji */}
        <Grid item xs={12} sm={6} md={2}>
          <Select
            fullWidth
            size="small"
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
            displayEmpty
            inputProps={{ 'aria-label': 'Typ akcji' }}
          >
            <MenuItem value="">
              <em>Wszystkie typy</em>
            </MenuItem>
            <MenuItem value="AUTO">Automatyczne</MenuItem>
            <MenuItem value="MANUAL">Ręczne</MenuItem>
          </Select>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6} md={2}>
          <Select
            fullWidth
            size="small"
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
            displayEmpty
            inputProps={{ 'aria-label': 'Status' }}
          >
            <MenuItem value="">
              <em>Wszystkie statusy</em>
            </MenuItem>
            <MenuItem value="LOW">Niski</MenuItem>
            <MenuItem value="MEDIUM">Średni</MenuItem>
            <MenuItem value="HIGH">Wysoki</MenuItem>
            <MenuItem value="NORMAL">Brak</MenuItem>
          </Select>
        </Grid>

        {/* Zakres dat */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            variant="outlined"
            label="Od daty"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate || ''}
            onChange={e => setFilters({...filters, startDate: e.target.value})}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            variant="outlined"
            label="Do daty"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate || ''}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
          />
        </Grid>

        {/* Przyciski akcji */}
        <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SearchIcon />}
            onClick={handleFilter}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Filtruj
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => {
              setFilters({
                search: "",
                type: "",
                status: "",
                startDate: "",
                endDate: ""
              });
              setFilteredLogs(logs);
            }}
          >
            Wyczyść
          </Button>
        </Grid>
      </Grid>

      {/* Dodatkowe opcje */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Aktywne filtry */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.search && (
            <Chip
              label={`Szukaj: "${filters.search}"`}
              onDelete={() => setFilters({...filters, search: ""})}
              size="small"
            />
          )}
          {filters.type && (
            <Chip
              label={`Typ: ${filters.type === 'AUTO' ? 'Automatyczne' : 'Ręczne'}`}
              onDelete={() => setFilters({...filters, type: ""})}
              size="small"
            />
          )}
          {filters.status && (
            <Chip
              label={`Status: ${
                filters.status === 'LOW' ? 'Niski' :
                filters.status === 'MEDIUM' ? 'Średni' :
                filters.status === 'HIGH' ? 'Wysoki' : 'Brak'
              }`}
              onDelete={() => setFilters({...filters, status: ""})}
              size="small"
            />
          )}
          {(filters.startDate || filters.endDate) && (
            <Chip
              label={`Data: ${filters.startDate || '...'} - ${filters.endDate || '...'}`}
              onDelete={() => setFilters({...filters, startDate: "", endDate: ""})}
              size="small"
            />
          )}
        </Box>

        {/* Przyciski akcji */}
        <Box>
          <Tooltip title="Odśwież">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Eksportuj
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ActionFilters;