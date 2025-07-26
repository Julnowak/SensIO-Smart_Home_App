import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  colors
} from '@mui/material';
import { SketchPicker } from 'react-color';

const RoomEditDialog = ({ open, onClose, room, homes, floors, onSave }) => {
  const [editedRoom, setEditedRoom] = useState({
    name: '',
    home: '',
    floor: '',
    light: false,
    warning: false,
    color: '#42adf5',
    isFavorite: false,
    isArchived: false
  });

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Initialize form with room data when opened
  useEffect(() => {
    if (room) {
      setEditedRoom({
        name: room.name || '',
        home: room.home?.id || '',
        floor: room.floor?.id || '',
        light: room.light || false,
        warning: room.warning || false,
        color: room.color || '#42adf5',
        isFavorite: room.isFavorite || false,
        isArchived: room.isArchived || false
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedRoom(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorChange = (color) => {
    setEditedRoom(prev => ({
      ...prev,
      color: color.hex
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...editedRoom,
      floor: editedRoom.floor || null  // Ensure floor can be null
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {room ? `Edytuj pokój ${room.room_id}` : 'Dodaj nowy pokój'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            fullWidth
            label="Nazwa pokoju"
            name="name"
            value={editedRoom.name}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth>
            <InputLabel>Dom</InputLabel>
            <Select
              name="home"
              value={editedRoom.home}
              onChange={handleChange}
              required
              label="Dom"
            >
              {homes.map(home => (
                <MenuItem key={home.id} value={home.id}>
                  {home.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Piętro (opcjonalnie)</InputLabel>
            <Select
              name="floor"
              value={editedRoom.floor}
              onChange={handleChange}
              label="Piętro (opcjonalnie)"
            >
              <MenuItem value="">
                <em>Brak</em>
              </MenuItem>
              {floors.map(floor => (
                <MenuItem key={floor.id} value={floor.id}>
                  {floor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Kolor pokoju:</Typography>
            <Chip
              label="Wybierz kolor"
              sx={{
                backgroundColor: editedRoom.color,
                cursor: 'pointer'
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <Box sx={{ position: 'absolute', zIndex: 1300 }}>
                <SketchPicker
                  color={editedRoom.color}
                  onChangeComplete={handleColorChange}
                />
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                name="light"
                checked={editedRoom.light}
                onChange={handleChange}
              />
            }
            label="Oświetlenie włączone"
          />

          <FormControlLabel
            control={
              <Switch
                name="warning"
                checked={editedRoom.warning}
                onChange={handleChange}
              />
            }
            label="Ostrzeżenie"
          />

          <FormControlLabel
            control={
              <Switch
                name="isFavorite"
                checked={editedRoom.isFavorite}
                onChange={handleChange}
              />
            }
            label="Ulubiony"
          />

          <FormControlLabel
            control={
              <Switch
                name="isArchived"
                checked={editedRoom.isArchived}
                onChange={handleChange}
              />
            }
            label="Zarchiwizowany"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomEditDialog;