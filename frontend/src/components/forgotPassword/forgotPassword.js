import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  CssBaseline
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Symulacja wysłania prośby o reset hasła
      await new Promise(resolve => setTimeout(resolve, 1500));

      // W prawdziwej aplikacji tutaj byłoby połączenie z API
      // await api.sendPasswordResetEmail(email);

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania prośby o reset hasła');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: theme.palette.secondary.main }}>
            <LockResetIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Resetowanie hasła
          </Typography>

          {success ? (
            <>
              <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                Link do resetowania hasła został wysłany na podany adres e-mail.
              </Alert>
              <Button
                component={RouterLink}
                to="/login"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
              >
                Powrót do logowania
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                Wprowadź swój adres e-mail, a wyślemy Ci link do resetowania hasła.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adres e-mail"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    type: 'email'
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Wyślij link resetujący'
                  )}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', width: '100%', mt: 2 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Pamiętasz hasło? Zaloguj się
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;