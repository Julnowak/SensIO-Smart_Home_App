import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: true,
    twoFactorAuth: false,
    darkMode: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ustawienia
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Powiadomienia
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
          }
          label="Powiadomienia e-mail"
        />
          <br/>
        <FormControlLabel
          control={
            <Switch
              checked={settings.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
            />
          }
          label="Usuwanie bez potwierdzenia"
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prywatność
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.publicProfile}
              onChange={() => handleToggle('publicProfile')}
            />
          }
          label="Publiczny profil"
        />
      </Paper>
    </Box>
  );
};

export default Settings;
