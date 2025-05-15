import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MUILink,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box sx={{
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(213,213,213,0.52)',
      pt: 8,
      mt: 'auto'
    }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          justifyContent="space-between"
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        >
          {/* Szybkie linki */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.secondary.main,
                alignSelf: { xs: 'center', md: 'flex-start' }
              }}
            >
              Szybkie linki
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              '& a': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: theme.palette.secondary.main,
                  transform: 'translateX(5px)'
                }
              }
            }}>
              <MUILink
                component={RouterLink}
                to="/about"
                color="inherit"
                underline="none"
                sx={{ mx: { xs: 'auto', md: 0 } }}
              >
                O nas
              </MUILink>
              <MUILink
                component={RouterLink}
                to="/contact"
                color="inherit"
                underline="none"
                sx={{ mx: { xs: 'auto', md: 0 } }}
              >
                Kontakt
              </MUILink>
              <MUILink
                component={RouterLink}
                to="/privacy-policy"
                color="inherit"
                underline="none"
                sx={{ mx: { xs: 'auto', md: 0 } }}
              >
                Polityka prywatności
              </MUILink>
            </Box>
          </Grid>

          {/* Kontakt */}
          <Grid item xs={12} md={4} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' }
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.secondary.main
              }}
            >
              Kontakt
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: { xs: 'center', md: 'flex-start' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaMapMarkerAlt style={{ flexShrink: 0 }} />
                <Typography variant="body2">
                  ul. Przykładowa 123<br/>
                  00-001 Warszawa
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaPhone style={{ flexShrink: 0 }} />
                <MUILink href="tel:+48123456789" color="inherit" underline="hover">
                  +48 123 456 789
                </MUILink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaEnvelope style={{ flexShrink: 0 }} />
                <MUILink href="mailto:kontakt@example.com" color="inherit" underline="hover">
                  kontakt@example.com
                </MUILink>
              </Box>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} md={3} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' }
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.secondary.main
              }}
            >
              Śledź nas
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 1,
              justifyContent: { xs: 'center', md: 'flex-start' },
              '& .MuiIconButton-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: theme.palette.secondary.main,
                  transform: 'translateY(-3px)'
                }
              }
            }}>
              <IconButton href="#" color="inherit" aria-label="Facebook">
                <FaFacebook fontSize="1.5rem" />
              </IconButton>
              <IconButton href="#" color="inherit" aria-label="Twitter">
                <FaTwitter fontSize="1.5rem" />
              </IconButton>
              <IconButton href="#" color="inherit" aria-label="Instagram">
                <FaInstagram fontSize="1.5rem" />
              </IconButton>
              <IconButton href="#" color="inherit" aria-label="LinkedIn">
                <FaLinkedin fontSize="1.5rem" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{
          my: 6,
          backgroundColor: theme.palette.divider,
          opacity: 0.2
        }} />

        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
            fontSize: '0.875rem',
            textAlign: { xs: 'center', md: 'center' },
            '& a': {
              color: 'inherit',
              textDecoration: 'underline',
              '&:hover': {
                color: theme.palette.secondary.main
              }
            }
          }}
        >
          &copy; {new Date().getFullYear()} SensIO. Wszelkie prawa zastrzeżone. |
          <MUILink
            component={RouterLink}
            to="/terms-of-service"
            color="inherit"
            sx={{ ml: 1 }}
          >
            Regulamin
          </MUILink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;