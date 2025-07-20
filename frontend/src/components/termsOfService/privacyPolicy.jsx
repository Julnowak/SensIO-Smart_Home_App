import React from 'react';
import { Container, Typography, Paper, Box, Link, List, ListItem, ListItemText } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Polityka Prywatności
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            Ostatnia aktualizacja: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
            użytkowników serwisu www.przykladowastrona.pl (zwanego dalej "Serwisem").
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            1. Administrator Danych
          </Typography>
          <Typography variant="body1" paragraph>
            Administratorem danych osobowych jest:
            <br />
            <strong>Nazwa Firmy</strong>
            <br />
            Adres: ul. Przykładowa 123, 00-000 Warszawa
            <br />
            NIP: 1234567890
            <br />
            Email: <Link href="mailto:odo@przykladowastrona.pl">odo@przykladowastrona.pl</Link>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            2. Rodzaje zbieranych danych
          </Typography>
          <Typography variant="body1" paragraph>
            W ramach Serwisu możemy przetwarzać następujące dane:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Dane podawane w formularzach (imię, nazwisko, adres email)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Dane związane z korzystaniem z Serwisu (adres IP, typ przeglądarki)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Dane cookies i podobnych technologii" />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            3. Cel przetwarzania danych
          </Typography>
          <Typography variant="body1" paragraph>
            Dane osobowe są przetwarzane w celu:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Świadczenia usług drogą elektroniczną" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Komunikacji z użytkownikiem" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Analizy ruchu w Serwisie" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Marketingu własnych produktów i usług" />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            4. Podstawa prawna przetwarzania
          </Typography>
          <Typography variant="body1" paragraph>
            Przetwarzanie danych odbywa się na podstawie:
            <br />
            • Art. 6 ust. 1 lit. a RODO - zgoda użytkownika
            <br />
            • Art. 6 ust. 1 lit. b RODO - wykonanie umowy
            <br />
            • Art. 6 ust. 1 lit. f RODO - prawnie uzasadniony interes administratora
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            5. Prawa użytkownika
          </Typography>
          <Typography variant="body1" paragraph>
            Każda osoba, której dane dotyczą ma prawo do:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Dostępu do swoich danych" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Sprostowania danych" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Usunięcia danych (prawo do bycia zapomnianym)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Ograniczenia przetwarzania" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Przenoszenia danych" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Wniesienia sprzeciwu" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Wniesienia skargi do organu nadzorczego (PUODO)" />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            6. Okres przechowywania danych
          </Typography>
          <Typography variant="body1" paragraph>
            Dane osobowe będą przechowywane przez okres niezbędny do realizacji celów, nie dłużej niż:
            <br />
            • Dla danych marketingowych - do momentu cofnięcia zgody
            <br />
            • Dla danych kontraktowych - przez okres wymagany przepisami prawa
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            7. Pliki cookies
          </Typography>
          <Typography variant="body1" paragraph>
            Serwis korzysta z plików cookies w celu zapewnienia prawidłowego działania.
            Użytkownik może zarządzać plikami cookies w ustawieniach przeglądarki.
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            W sprawach dotyczących ochrony danych osobowych prosimy o kontakt: <Link href="mailto:odo@przykladowastrona.pl">odo@przykladowastrona.pl</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;