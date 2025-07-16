import React, { useState } from 'react';
import {TextField, Popover, Box, Typography, Dialog, InputAdornment} from '@mui/material';
import { ChromePicker } from 'react-color';

const ColorPickerInput = ({ label = "Pick a color", value, onChange }) => {
  const [color, setColor] = useState('#2196f3');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (colorResult) => {
    setColor(colorResult.hex);
  };

  return (
    <div>
      <TextField
        label="Kolor"
        value={color}
        onClick={handleClick}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1px solid #ccc',
                }}
              />
            </InputAdornment>
          ),
        }}
        fullWidth
      />

      <Dialog open={open} onClose={handleClose}>
        <Box p={2}>
          <Typography variant="subtitle1" gutterBottom>Wybierz kolor</Typography>
          <ChromePicker color={color} onChange={handleChange} />
        </Box>
      </Dialog>
    </div>
  );
};

export default ColorPickerInput;
