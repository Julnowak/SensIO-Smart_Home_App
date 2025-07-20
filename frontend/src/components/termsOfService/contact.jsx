import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Link,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  Send
} from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tutaj logika wysyłania formularza
    console.log('Form submitted:', formData);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', message: '' });
    // W rzeczywistej aplikacji tutaj byłoby połączenie z API
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Skontaktuj się z nami
        </Typography>

        {submitStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 4 }}>
            <AlertTitle>Sukces!</AlertTitle>
            Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Formularz kontaktowy
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Imię i nazwisko"
                variant="outlined"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Adres email"
                variant="outlined"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Twoja wiadomość"
                variant="outlined"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<Send />}
                sx={{ px: 4, py: 1.5 }}
              >
                Wyślij wiadomość
              </Button>
            </form>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Dane kontaktowe
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  <Link href="mailto:kontakt@przykladowastrona.pl" underline="hover">
                    kontakt@przykladowastrona.pl
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  <Link href="tel:+48123456789" underline="hover">
                    +48 123 456 789
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn color="primary" sx={{ mr: 2, mt: 0.5 }} />
                <Typography variant="body1">
                  ul. Przykładowa 123<br />
                  00-000 Warszawa<br />
                  Polska
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Godziny otwarcia
            </Typography>
            <Typography variant="body1" paragraph>
              Poniedziałek - Piątek: 8:00 - 16:00<br />
              Sobota - Niedziela: Zamknięte
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Znajdź nas w social media
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" aria-label="Facebook" component="a" href="#">
                <Facebook fontSize="large" />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter" component="a" href="#">
                <Twitter fontSize="large" />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn" component="a" href="#">
                <LinkedIn fontSize="large" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Lokalizacja
          </Typography>
          <Box sx={{ height: '300px', width: '100%', backgroundColor: '#eee', borderRadius: 1 }}>
            {/* Tutaj można osadzić mapę Google Maps lub inną */}
            <Typography variant="body1" align="center" sx={{ pt: 15 }}>
              [Tutaj będzie osadzona mapa]
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact;