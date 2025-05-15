import React from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip, Grid, Button
} from '@mui/material';
import {
  School,
  Code,
  DesignServices,
  Psychology,
  Book,
  GitHub
} from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar
            alt="Studentka"
            src="/student-avatar.jpg" // Tutaj możesz dodać prawdziwe zdjęcie
            sx={{
              width: 150,
              height: 150,
              margin: '0 auto 20px',
              border: '4px solid #1976d2'
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            O projekcie
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Strona stworzona jako część pracy magisterskiej
          </Typography>
        </Box>

        <Box sx={{ mb: 6, textAlign: "justify" }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Cel projektu
          </Typography>
          <Typography variant="body1" paragraph>
            SensIO to aplikacja internetowa, która została opracowana przez Julię Nowak - studentkę V roku Automatyki i Robotyki na Akademii Górniczo-Hutniczej
            w Krakowie, jako praktyczna część pracy magisterskiej.
          </Typography>
          <Typography variant="body1" paragraph>
            Głównym celem projektu było utworzenie systemu do zarządzania czujnikami, przeznaczonego dla budynków inteligentnych.
            W projekcie podążano za najnowszymi trendami technologicznymi - aplikacja łączy zagadnienia Internetu Rzeczy w budynkach inteligentnych (tzw. Smart Buildings)
            oraz algorytmy uczenia maszynowego.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Użyte technologie
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Code color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="React.js" secondary="Biblioteka frontendowa" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DesignServices color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Material-UI" secondary="System designu i komponenty UI" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Psychology color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="React Hook Form" secondary="Obsługa formularzy" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Book color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="React Router" secondary="Nawigacja w aplikacji" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GitHub color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Git" secondary="Kontrola wersji" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="ES6+" secondary="Nowoczesny JavaScript" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Funkcjonalności projektu
          </Typography>
          <Typography variant="body1" paragraph>
            W ramach pracy magisterskiej zaimplementowano następujące kluczowe funkcjonalności:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" paragraph>
              Responsywny interfejs użytkownika dostosowany do różnych urządzeń
            </Typography>
            <Typography component="li" paragraph>
              System autentykacji i zarządzania użytkownikami
            </Typography>
            <Typography component="li" paragraph>
              Panel administracyjny z zestawieniem statystyk
            </Typography>
            <Typography component="li" paragraph>
              Moduł generowania dynamicznych dokumentów (PDF)
            </Typography>
          </Box>
          {/*<Typography variant="body1">*/}
          {/*  Projekt został pozytywnie oceniony przez promotora i recenzenta, uzyskując ocenę celującą.*/}
          {/*</Typography>*/}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Dostępność kodu źródłowego
          </Typography>
          <Typography variant="body1" paragraph>
            Kod źródłowy projektu jest dostępny publicznie w repozytorium GitHub:
          </Typography>
          <Button
            variant="outlined"
            size="large"
            startIcon={<GitHub />}
            href="https://github.com/Julnowak/SensIO-Smart_Home_App"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 2 }}
          >
            Zobacz repozytorium
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;