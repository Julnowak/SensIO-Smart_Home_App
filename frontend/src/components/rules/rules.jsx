import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  Switch
} from '@mui/material';
import {
  AddCircleOutline,
  DeleteOutline,
  EditOutlined,
  ScheduleOutlined,
  RuleFolderOutlined,
  DateRange,
  AccessTime
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';

const Rules = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rules, setRules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState({
    name: '',
    locations: [],
    rooms: [],
    floors: [],
    start_date: new Date(),
    end_date: null,
    value_low: '',
    value_high: '',
    isRecurrent: false,
    recurrentTime: ''
  });

  // Mock data
  const [locations, setLocations] = useState([
    { id: 1, name: 'Dom główny' },
    { id: 2, name: 'Biurowiec' }
  ]);

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Salon' },
    { id: 2, name: 'Kuchnia' },
    { id: 3, name: 'Sypialnia' }
  ]);

  const [floors, setFloors] = useState([
    { id: 1, name: 'Parter' },
    { id: 2, name: 'Pierwsze piętro' }
  ]);

  const recurrenceTypes = [
    { value: '1', label: 'Godzinowo' },
    { value: '2', label: 'Dziennie' },
    { value: '3', label: 'Tygodniowo' },
    { value: '4', label: 'Miesięcznie' },
    { value: '5', label: 'Rocznie' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRule(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCurrentRule(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name, value) => {
    setCurrentRule(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setCurrentRule(prev => ({ ...prev, [name]: value }));
  };

  const toggleLocation = (location) => {
    setCurrentRule(prev => {
      const isSelected = prev.locations.some(l => l.id === location.id);
      return {
        ...prev,
        locations: isSelected
          ? prev.locations.filter(l => l.id !== location.id)
          : [...prev.locations, location]
      };
    });
  };

  const toggleRoom = (room) => {
    setCurrentRule(prev => {
      const isSelected = prev.rooms.some(r => r.id === room.id);
      return {
        ...prev,
        rooms: isSelected
          ? prev.rooms.filter(r => r.id !== room.id)
          : [...prev.rooms, room]
      };
    });
  };

  const toggleFloor = (floor) => {
    setCurrentRule(prev => {
      const isSelected = prev.floors.some(f => f.id === floor.id);
      return {
        ...prev,
        floors: isSelected
          ? prev.floors.filter(f => f.id !== floor.id)
          : [...prev.floors, floor]
      };
    });
  };

  const handleSubmit = () => {
    if (currentRule.id) {
      setRules(rules.map(r => (r.id === currentRule.id ? currentRule : r)));
    } else {
      const newRule = { ...currentRule, id: rules.length + 1 };
      setRules([...rules, newRule]);
    }
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentRule({
      name: '',
      locations: [],
      rooms: [],
      floors: [],
      start_date: new Date(),
      end_date: null,
      value_low: '',
      value_high: '',
      isRecurrent: false,
      recurrentTime: ''
    });
  };

  const editRule = (rule) => {
    setCurrentRule(rule);
    setOpenDialog(true);
  };

  const deleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            <RuleFolderOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
            Zarządzanie zasadami i harmonogramami
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => setOpenDialog(true)}
          >
            Nowa zasada
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Aktywne zasady" icon={<RuleFolderOutlined />} />
            <Tab label="Historia" icon={<ScheduleOutlined />} />
          </Tabs>
          <Divider sx={{ mb: 2 }} />

          {activeTab === 0 && (
            <Box>
              {rules.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <ScheduleOutlined sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6">Brak zdefiniowanych zasad</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Kliknij przycisk "Nowa zasada", aby dodać pierwszą zasadę
                  </Typography>
                </Box>
              ) : (
                <List>
                  {rules.map(rule => (
                    <ListItem
                      key={rule.id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => editRule(rule)}>
                            <EditOutlined />
                          </IconButton>
                          <IconButton edge="end" onClick={() => deleteRule(rule.id)}>
                            <DeleteOutline />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <ListItemText
                        primary={rule.name}
                        secondary={
                          <>
                            <Box component="span" sx={{ display: 'block' }}>
                              <DateRange fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {rule.start_date?.toLocaleDateString()}
                              {rule.end_date && ` - ${rule.end_date.toLocaleDateString()}`}
                            </Box>
                            {rule.isRecurrent && (
                              <Box component="span" sx={{ display: 'block' }}>
                                <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {recurrenceTypes.find(t => t.value === rule.recurrentTime)?.label}
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6">Historia wykonania zasad</Typography>
              <Typography sx={{ mt: 2 }}>W tej sekcji będzie wyświetlana historia wykonania zasad</Typography>
            </Box>
          )}
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentRule.id ? 'Edytuj zasadę' : 'Dodaj nową zasadę'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nazwa zasady"
                  name="name"
                  value={currentRule.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Lokalizacje
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {locations.map(location => (
                    <Chip
                      key={location.id}
                      label={location.name}
                      onClick={() => toggleLocation(location)}
                      color={currentRule.locations.some(l => l.id === location.id) ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Piętra
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {floors.map(floor => (
                    <Chip
                      key={floor.id}
                      label={floor.name}
                      onClick={() => toggleFloor(floor)}
                      color={currentRule.floors.some(f => f.id === floor.id) ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Pomieszczenia
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {rooms.map(room => (
                    <Chip
                      key={room.id}
                      label={room.name}
                      onClick={() => toggleRoom(room)}
                      color={currentRule.rooms.some(r => r.id === room.id) ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Data rozpoczęcia"
                  value={currentRule.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Data zakończenia (opcjonalnie)"
                  value={currentRule.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Wartość minimalna (opcjonalnie)"
                  name="value_low"
                  value={currentRule.value_low}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Wartość maksymalna (opcjonalnie)"
                  name="value_high"
                  value={currentRule.value_high}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isRecurrent"
                      checked={currentRule.isRecurrent}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Zasada cykliczna"
                />
              </Grid>

              {currentRule.isRecurrent && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Częstotliwość</InputLabel>
                    <Select
                      name="recurrentTime"
                      value={currentRule.recurrentTime}
                      label="Częstotliwość"
                      onChange={handleSelectChange}
                      required
                    >
                      {recurrenceTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button onClick={handleSubmit} variant="contained">
              {currentRule.id ? 'Zapisz zmiany' : 'Dodaj zasadę'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Rules;