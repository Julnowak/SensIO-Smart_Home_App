import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  useTheme
} from '@mui/material';
import {
  PlayCircleFilled,
  Devices,
  Dashboard,
  ShowChart,
  EnergySavingsLeaf,
  Security,
  IntegrationInstructions,
  Forum,
  YouTube
} from '@mui/icons-material';

const Homepage = () => {
  const theme = useTheme();

  const features = [
    { icon: <Devices sx={{ fontSize: 40 }} />, title: "Integracja Urządzeń", text: "Łącz dowolne inteligentne urządzenia poprzez naszą uniwersalną platformę" },
    { icon: <Dashboard sx={{ fontSize: 40 }} />, title: "Custom Dashboard", text: "Twórz spersonalizowane panele kontrolne dostosowane do Twoich potrzeb" },
    { icon: <ShowChart sx={{ fontSize: 40 }} />, title: "Analiza Danych", text: "Zaawansowane wykresy i raporty w czasie rzeczywistym" },
    { icon: <EnergySavingsLeaf sx={{ fontSize: 40 }} />, title: "Optymalizacja Energii", text: "AI przewiduje zużycie energii i sugeruje optymalizacje" },
    { icon: <Security sx={{ fontSize: 40 }} />, title: "Bezpieczeństwo", text: "Zaawansowane systemy zabezpieczeń danych i dostępu" },
    { icon: <IntegrationInstructions sx={{ fontSize: 40 }} />, title: "Automatyzacja", text: "Twórz własne scenariusze działania systemu" }
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Container maxWidth="xl" sx={{
        py: 15,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        textAlign: 'center'
      }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Przekształć swój budynek w <span style={{ color: theme.palette.secondary.light }}>Inteligentną Przestrzeń</span>
            </Typography>
            <Typography variant="h5" sx={{ mb: 4 }}>
              Monitoruj, analizuj i optymalizuj zarządzanie budynkiem w czasie rzeczywistym
            </Typography>
            <Stack direction="row" spacing={3} justifyContent="center">
              <Button
                component={Link}
                to="/get-started"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 5, py: 1.5, borderRadius: 3 }}
              >
                Rozpocznij
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<PlayCircleFilled />}
                sx={{ px: 5, py: 1.5, borderRadius: 3 }}
              >
                Demo
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhJ9vY-WJviH34cgDfbG2Hn_cBf0t5BBmaWrmH--NzBO3pjGP6hjV7pb8s958ug9K7p6iR-3vz6nlw7c4i5ZdMw"
              alt="Smart Building"
              style={{ width: '100%', maxWidth: 600 }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Typography variant="h3" component="h2" textAlign="center" sx={{ mb: 8, fontWeight: 700 }}>
          Nasze Kluczowe Funkcje
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{
                p: 3,
                height: '100%',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: 6
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <div style={{ color: theme.palette.primary.main }}>{feature.icon}</div>
                  <Typography variant="h5" component="h3" sx={{ my: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Dashboard Preview */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 700 }}>
              Intuicyjny Panel Sterowania
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Spersonalizuj swój dashboard z widgetami monitorującymi:
            </Typography>
            <ul style={{ color: theme.palette.text.secondary, paddingLeft: 20 }}>
              <li>Stan wszystkich podłączonych urządzeń</li>
              <li>Wykresy temperatury i wilgotności</li>
              <li>Zużycie energii w czasie rzeczywistym</li>
              <li>Prognozy energetyczne AI</li>
              <li>Statystyki historyczne</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardMedia
                component="img"
                image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhJ9vY-WJviH34cgDfbG2Hn_cBf0t5BBmaWrmH--NzBO3pjGP6hjV7pb8s958ug9K7p6iR-3vz6nlw7c4i5ZdMw"
                alt="Podgląd dashboardu"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Video Section */}
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" sx={{ mb: 6, fontWeight: 700 }}>
          Zobacz Jak Działa SensIO
        </Typography>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 6
        }}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="YouTube video player"
            style={{ position: 'absolute', top: 0, left: 0 }}
            allowFullScreen
          />
        </div>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="xl" sx={{ py: 10, textAlign: 'center' }}>
        <Card sx={{
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white'
        }}>
          <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Gotowy na Inteligentne Zarządzanie?
          </Typography>
          <Typography variant="h5" sx={{ mb: 5 }}>
            Dołącz do ponad 50,000 zadowolonych użytkowników
          </Typography>
          <Button
            component={Link}
            to="/get-started"
            variant="contained"
            color="inherit"
            size="large"
            sx={{ px: 8, py: 2, borderRadius: 3 }}
          >
            Rozpocznij Za Darmo
          </Button>
        </Card>
      </Container>
    </div>
  );
};

export default Homepage;