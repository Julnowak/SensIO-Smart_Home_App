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
  Stack
} from '@mui/material';
import {
  Facebook,
  Google,
  GitHub,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { AuthContext } from "../../../AuthContext";
import { useTheme } from '@mui/material/styles';

const Login = () => {
  const theme = useTheme();
  const { loginUser } = useContext(AuthContext);
  const [errmess, setErrmess] = useState(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(email, password);
      navigate("/main");
    } catch (error) {
      setErrmess(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social auth logic
    console.log(`Login with ${provider}`);
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
            alt="Login Illustration"
            style={{ width: '100%', maxWidth: 300 }}
          />
          <Typography variant="h5" sx={{
            mt: 4,
            color: 'common.white',
            textAlign: 'center',
            fontWeight: 500
          }}>
            Witaj na naszej platformie!
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
            Logowanie
          </Typography>

          {errmess && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errmess}
            </Alert>
          )}

          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            <TextField
              fullWidth
              label="E-mail"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              InputProps={{
                autoComplete: 'email'
              }}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
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
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Button
                component={Link}
                to="/register"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Utwórz konto
              </Button>
              <Button
                component={Link}
                to="/forgot-password"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Zapomniałeś hasła?
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                LUB ZALOGUJ PRZEZ
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

export default Login;