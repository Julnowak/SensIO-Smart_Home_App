import React from 'react';
import { Container, Typography, Paper, Box, Link } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Regulamin Serwisu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            Ostatnia aktualizacja: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            1. Postanowienia ogólne
          </Typography>
          <Typography variant="body1" paragraph>
            Niniejszy regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem www.przykladowastrona.pl
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            2. Definicje
          </Typography>
          <Typography variant="body1" paragraph>
            Użyte w regulaminie określenia oznaczają:
            <br />
            - Serwis - stronę internetową www.przykladowastrona.pl
            <br />
            - Użytkownik - każdą osobę korzystającą z Serwisu
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            3. Warunki korzystania z Serwisu
          </Typography>
          <Typography variant="body1" paragraph>
            3.1. Korzystanie z Serwisu jest dobrowolne i bezpłatne.
            <br />
            3.2. Użytkownik zobowiązuje się do wykorzystywania Serwisu zgodnie z prawem.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            4. Ograniczenia odpowiedzialności
          </Typography>
          <Typography variant="body1" paragraph>
            Administrator Serwisu nie ponosi odpowiedzialności za:
            <br />
            - treści zamieszczane przez użytkowników
            <br />
            - problemy techniczne związane z funkcjonowaniem Serwisu
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            5. Postanowienia końcowe
          </Typography>
          <Typography variant="body1" paragraph>
            5.1. Regulamin wchodzi w życie z dniem publikacji.
            <br />
            5.2. W sprawach nieuregulowanych niniejszym regulaminem mają zastosowanie przepisy prawa polskiego.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            W przypadku pytań prosimy o kontakt: <Link href="mailto:kontakt@przykladowastrona.pl">kontakt@przykladowastrona.pl</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;