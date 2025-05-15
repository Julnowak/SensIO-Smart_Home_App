import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AddHome = ({ onSave, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    regards: '',
    owner: null,
    floor_num: 1,
    building_type: 'residual',
    year_of_construction: new Date().getFullYear(),
    building_area: 0,
    current: false,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const buildingTypes = [
    { value: 'residual', label: 'Mieszkalne' },
    { value: 'public', label: 'Publiczne' },
    { value: 'industrial', label: 'Przemysłowe' },
    { value: 'commercial', label: 'Komercyjne/handlowo-usługowe' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      year_of_construction: date ? date.getFullYear() : new Date().getFullYear(),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Dodaj nowy budynek
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nazwa budynku"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adres"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Uwagi"
                name="regards"
                value={formData.regards}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="owner-label">Właściciel</InputLabel>
                <Select
                  labelId="owner-label"
                  name="owner"
                  value={formData.owner || ''}
                  onChange={handleChange}
                >
                  {users?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Liczba pięter"
                name="floor_num"
                type="number"
                value={formData.floor_num}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="building-type-label">Typ budynku</InputLabel>
                <Select
                  labelId="building-type-label"
                  name="building_type"
                  value={formData.building_type}
                  onChange={handleChange}
                >
                  {buildingTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                views={['year']}
                label="Rok budowy"
                value={new Date(formData.year_of_construction, 0, 1)}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Powierzchnia budynku (m²)"
                name="building_area"
                type="number"
                value={formData.building_area}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="current"
                    checked={formData.current}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Bieżący budynek"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Dodaj zdjęcie budynku
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box mt={2}>
                  <img
                    src={imagePreview}
                    alt="Podgląd zdjęcia budynku"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Zapisz budynek
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default AddHome;