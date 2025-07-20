import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Stylizowana karta
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4]
  }
}));

const RulesTab = ({ rules }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    locations: [],
    rooms: [],
    floors: [],
    sensors: [],
    start_date: new Date().toISOString().slice(0, 16),
    end_date: '',
    value_low: '',
    value_high: '',
    isRecurrent: false,
    recurrentTime: ''
  });

  const recurrencyTypes = [
    { value: '1', label: 'godzinowo' },
    { value: '2', label: 'dziennie' },
    { value: '3', label: 'tygodniowo' },
    { value: '4', label: 'miesięcznie' },
    { value: '5', label: 'rocznie' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRule(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewRule(prev => ({ ...prev, [name]: checked }));
  };

  const handleArrayChange = (name, value) => {
    setNewRule(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = () => {
    // Tutaj logika wysyłania nowej reguły do API
    console.log('New rule:', newRule);
    setOpenDialog(false);
    // Reset formularza
    setNewRule({
      name: '',
      locations: [],
      rooms: [],
      floors: [],
      sensors: [],
      start_date: new Date().toISOString().slice(0, 16),
      end_date: '',
      value_low: '',
      value_high: '',
      isRecurrent: false,
      recurrentTime: ''
    });
  };

  return (
    <>
        <Grid container spacing={3}>
          {rules.length > 0 ? (
            rules.map((rule) => (
              <Grid size={{xs: 12, sm: 6, md: 4}} key={rule.id}>
                <StyledCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {rule.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Zakres wartości:</strong> {rule.value_low || '–'} - {rule.value_high || '–'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Okres:</strong> {new Date(rule.start_date).toLocaleString()}
                      {rule.end_date && ` - ${new Date(rule.end_date).toLocaleString()}`}
                    </Typography>
                    {rule.isRecurrent && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Częstotliwość:</strong> {recurrencyTypes.find(t => t.value === rule.recurrentTime)?.label}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1 }}>
                      {rule.locations.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                          {rule.locations.map(loc => (
                            <Chip key={loc.id} label={loc.name} size="small" />
                          ))}
                        </Box>
                      )}
                      {rule.rooms.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                          {rule.rooms.map(room => (
                            <Chip key={room.id} label={room.name} size="small" color="primary" />
                          ))}
                        </Box>
                      )}
                      {rule.floors.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                          {rule.floors.map(floor => (
                            <Chip key={floor.id} label={floor.name} size="small" color="secondary" />
                          ))}
                        </Box>
                      )}
                      {rule.sensors.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {rule.sensors.map(sensor => (
                            <Chip key={sensor.sensor_id} label={sensor.name} size="small" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : (
            <Grid size={{xs: 12}}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  textAlign: 'center',
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Brak zdefiniowanych reguł
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Nie masz jeszcze żadnych reguł. Dodaj nową, aby rozpocząć.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
                >
                  Dodaj nową regułę
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

      {/* Przycisk dodawania nowej reguły (widoczny gdy są już jakieś reguły) */}
      {rules.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Dodaj nową regułę
          </Button>
        </Box>
      )}

      {/* Dialog do dodawania nowej reguły */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Dodaj nową regułę</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nazwa reguły"
                name="name"
                value={newRule.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Data rozpoczęcia"
                type="datetime-local"
                name="start_date"
                value={newRule.start_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Data zakończenia (opcjonalnie)"
                type="datetime-local"
                name="end_date"
                value={newRule.end_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Wartość minimalna (opcjonalnie)"
                name="value_low"
                value={newRule.value_low}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Wartość maksymalna (opcjonalnie)"
                name="value_high"
                value={newRule.value_high}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid size={{xs: 12}}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newRule.isRecurrent}
                    onChange={handleCheckboxChange}
                    name="isRecurrent"
                  />
                }
                label="Reguła cykliczna"
              />
            </Grid>

            {newRule.isRecurrent && (
              <Grid size={{xs: 12}}>
                <TextField
                  select
                  fullWidth
                  label="Częstotliwość"
                  name="recurrentTime"
                  value={newRule.recurrentTime}
                  onChange={handleInputChange}
                >
                  {recurrencyTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/*<Grid size={{xs: 12}}>*/}
            {/*  <TextField*/}
            {/*    select*/}
            {/*    fullWidth*/}
            {/*    label="Lokalizacje (opcjonalnie)"*/}
            {/*    SelectProps={{*/}
            {/*      multiple: true,*/}
            {/*      value: newRule.locations,*/}
            {/*      onChange: (e) => handleArrayChange('locations', e.target.value)*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {locations.map((location) => (*/}
            {/*      <MenuItem key={location.id} value={location.id}>*/}
            {/*        {location.name}*/}
            {/*      </MenuItem>*/}
            {/*    ))}*/}
            {/*  </TextField>*/}
            {/*</Grid>*/}

            {/*<Grid size={{xs: 12, sm: 6}}>*/}
            {/*  <TextField*/}
            {/*    select*/}
            {/*    fullWidth*/}
            {/*    label="Piętra (opcjonalnie)"*/}
            {/*    SelectProps={{*/}
            {/*      multiple: true,*/}
            {/*      value: newRule.floors,*/}
            {/*      onChange: (e) => handleArrayChange('floors', e.target.value)*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {floors.map((floor) => (*/}
            {/*      <MenuItem key={floor.id} value={floor.id}>*/}
            {/*        {floor.name}*/}
            {/*      </MenuItem>*/}
            {/*    ))}*/}
            {/*  </TextField>*/}
            {/*</Grid>*/}

            {/*<Grid size={{xs: 12, sm: 6}}>*/}
            {/*  <TextField*/}
            {/*    select*/}
            {/*    fullWidth*/}
            {/*    label="Pokoje (opcjonalnie)"*/}
            {/*    SelectProps={{*/}
            {/*      multiple: true,*/}
            {/*      value: newRule.rooms,*/}
            {/*      onChange: (e) => handleArrayChange('rooms', e.target.value)*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {rooms.map((room) => (*/}
            {/*      <MenuItem key={room.id} value={room.id}>*/}
            {/*        {room.name}*/}
            {/*      </MenuItem>*/}
            {/*    ))}*/}
            {/*  </TextField>*/}
            {/*</Grid>*/}

            {/*<Grid size={{xs: 12,}}>*/}
            {/*  <TextField*/}
            {/*    select*/}
            {/*    fullWidth*/}
            {/*    label="Sensory (opcjonalnie)"*/}
            {/*    SelectProps={{*/}
            {/*      multiple: true,*/}
            {/*      value: newRule.sensors,*/}
            {/*      onChange: (e) => handleArrayChange('sensors', e.target.value)*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    {sensors.map((sensor) => (*/}
            {/*      <MenuItem key={sensor.sensor_id} value={sensor.sensor_id}>*/}
            {/*        {sensor.name}*/}
            {/*      </MenuItem>*/}
            {/*    ))}*/}
            {/*  </TextField>*/}
            {/*</Grid>*/}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Zapisz regułę
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RulesTab;