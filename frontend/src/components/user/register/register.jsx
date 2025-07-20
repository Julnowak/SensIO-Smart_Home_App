import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Facebook,
  Google,
  GitHub,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { AuthContext } from "../../../AuthContext.jsx";
import { useTheme } from '@mui/material/styles';

const Register = () => {
  const theme = useTheme();
  const { registerUser } = useContext(AuthContext);
  const [errmess, setErrmess] = useState(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordSecond, setPasswordSecond] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(username, email, password, passwordSecond);
      navigate("/main");
    } catch (error) {
      setErrmess(error.message || "Rejestracja nie powiodła się. Sprawdź dane.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social auth logic
    console.log(`Rejestracja przez ${provider}`);
  };

  return (
    <Container maxWidth="lg" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      py: 8
    }}>
      <Box sx={{
        display: 'flex',
        borderRadius: 4,
        boxShadow: 3,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'background.paper',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column'
        }
      }}>
        {/* Graphic Section */}
        <Box sx={{
          width: '40%',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          [theme.breakpoints.down('md')]: {
            width: '100%',
            py: 8
          }
        }}>
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/boy-using-wireless-technology-illustration-download-in-svg-png-gif-file-formats--wifi-logo-connection-smarthome-smartphone-pack-e-commerce-shopping-illustrations-3443561.png"
            alt="Registration Illustration"
            style={{ width: '100%', maxWidth: 300 }}
          />
          <Typography variant="h5" sx={{
            mt: 4,
            color: 'common.white',
            textAlign: 'center',
            fontWeight: 500
          }}>
            Dołącz do naszej społeczności
          </Typography>
        </Box>

        {/* Form Section */}
        <Box sx={{
          width: '60%',
          p: 6,
          [theme.breakpoints.down('md')]: {
            width: '100%',
            px: 4,
            py: 6
          }
        }}>
          <Typography variant="h4" component="h1" sx={{
            mb: 4,
            fontWeight: 700,
            color: 'text.primary'
          }}>
            Rejestracja
          </Typography>

          {errmess && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errmess}
            </Alert>
          )}

          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            <TextField
              fullWidth
              label="Nazwa użytkownika"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="E-mail"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <TextField
              fullWidth
              label="Hasło"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />

            <TextField
              fullWidth
              label="Powtórz hasło"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={passwordSecond}
              onChange={(e) => setPasswordSecond(e.target.value)}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Akceptuję <Link to="/terms">regulamin</Link> serwisu
                </Typography>
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !acceptedTerms}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 3
                }
              }}
            >
              {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Masz już konto?{' '}
                <Button
                  component={Link}
                  to="/login"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Zaloguj się
                </Button>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                LUB ZAREJESTRUJ PRZEZ
              </Typography>
            </Divider>

            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton
                onClick={() => handleSocialLogin('facebook')}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: '#1877f2',
                    color: 'common.white'
                  }
                }}
              >
                <Facebook fontSize="large" />
              </IconButton>

              <IconButton
                onClick={() => handleSocialLogin('google')}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: '#db4437',
                    color: 'common.white'
                  }
                }}
              >
                <Google fontSize="large" />
              </IconButton>

              <IconButton
                onClick={() => handleSocialLogin('github')}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: '#333',
                    color: 'common.white'
                  }
                }}
              >
                <GitHub fontSize="large" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;