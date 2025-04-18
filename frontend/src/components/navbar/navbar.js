import React, {useContext, useEffect, useState} from 'react';
import {
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    Divider,
    Typography,
    Box,
    useMediaQuery,
    styled, ListItemIcon, Button, ListItemText, ListItemButton, Collapse, List, Drawer, ListItem
} from '@mui/material';
import {
    HomeRounded,
    LoginRounded,
    LogoutRounded,
    DarkModeRounded,
    LightModeRounded,
    NotificationsRounded,
    MenuRounded,
    Person,
    DonutSmall,
    CameraIndoor,
    History,
    Rule,
    DoorBack,
    Devices,
    Home,
    ExpandMore,
    ChevronRight,
    CloseRounded,
    ExpandLess,
} from '@mui/icons-material';
import {ThemeContext} from "../../Theme";
import {AuthContext} from "../../AuthContext";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useTheme} from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({theme}) => ({
    backdropFilter: 'blur(8px)',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(213,213,213,0.52)',
    transition: theme.transitions.create(['background-color', 'box-shadow']),
}));

const CustomNavbar = () => {
    const theme = useTheme();
    const {toggleTheme} = useContext(ThemeContext);
    const {isAuthenticated} = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
    const [num, setNum] = useState(0);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const token = localStorage.getItem("access");
    const image_set = localStorage.getItem("image_set");

    const [managementAnchorEl, setManagementAnchorEl] = useState(null);

    // Menu handlers
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMobileMenuOpen = (event) => setMobileAnchorEl(event.currentTarget);
    const handleManagementMenuOpen = (event) => setManagementAnchorEl(event.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        setMobileAnchorEl(null);
        setManagementAnchorEl(null);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                const img = response.data.profile_picture
                    ? response.data.profile_picture.toString().slice(15)
                    : "/images/basic/user_no_picture.png";
                setImage(img);
                localStorage.setItem("image_set", img);


            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };


        const fetchNotifications = async () => {
            try {
                const notifications = await client.get(API_BASE_URL + "notifications/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setNum(notifications.data.num);
                console.log(notifications)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (token && !image_set) {
            fetchUserData();
        } else {
            setImage(image_set);
        }

        if (token) {
            fetchNotifications()
        }
    }, [image_set, token]);

    const renderDesktopMenu = () => (
        <>
            {isAuthenticated && (
                <>

                    <Box sx={{display: 'flex', alignItems: 'center', ml: 2}}>
                        <IconButton href="/main">
                            <HomeRounded/>
                        </IconButton>

                        <IconButton
                            onClick={handleManagementMenuOpen}
                            sx={{
                                color: 'text.primary',
                                p: 1.5,
                                borderRadius: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)'
                                },
                                '&.Mui-focusVisible': {
                                    bgcolor: 'action.selected'
                                }
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                            >
                                Zarządzaj
                                <ExpandMore sx={{
                                    fontSize: 18,
                                    transition: 'transform 0.2s',
                                    transform: Boolean(managementAnchorEl) ? 'rotate(180deg)' : 'none'
                                }}/>
                            </Typography>
                        </IconButton>

                        <Menu
                            anchorEl={managementAnchorEl}
                            open={Boolean(managementAnchorEl)}
                            onClose={handleClose}
                            elevation={2}
                            sx={{
                                '& .MuiPaper-root': {
                                    minWidth: 220,
                                    borderRadius: 2,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                    mt: 1.5
                                }
                            }}
                            transformOrigin={{horizontal: 'right', vertical: 'top'}}
                            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                            MenuListProps={{
                                sx: {py: 0.5}
                            }}
                        >
                            <MenuItem
                                href="/myHomes"
                                component="a"
                                sx={{
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <Home sx={{fontSize: 20, mr: 1.5}}/>
                                Moje lokacje
                            </MenuItem>

                            <MenuItem
                                href="/myDevices"
                                component="a"
                                sx={{
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <Devices sx={{fontSize: 20, mr: 1.5}}/>
                                Moje urządzenia
                            </MenuItem>

                            <MenuItem
                                href="/myRooms"
                                component="a"
                                sx={{
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <DoorBack sx={{fontSize: 20, mr: 1.5}}/>
                                Moje pomieszczenia
                            </MenuItem>

                            <Divider sx={{my: 0.5}}/>

                            <MenuItem
                                href="/rules"
                                component="a"
                                sx={{
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <Rule sx={{fontSize: 20, mr: 1.5}}/>
                                Reguły
                            </MenuItem>
                        </Menu>
                    </Box>

                    <IconButton href="/dashboard" sx={{"&:hover": {borderRadius: 2}}}>
                        <Typography variant="body1">Wykresy</Typography>
                    </IconButton>

                    <IconButton
                        href="/history"
                        sx={{
                            position: 'relative',
                            borderRadius: '50%', // Start circular
                            minWidth: 0,
                            padding: '8px',
                            transition: theme => theme.transitions.create(['all'], {
                                duration: theme.transitions.duration.standard,
                                easing: theme.transitions.easing.easeInOut,
                            }),

                            // Initial oval state (hidden)
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '40%',
                                height: '100%',
                                borderRadius: '24px',
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                opacity: 0,
                                transition: theme => theme.transitions.create(['all'], {
                                    duration: theme.transitions.duration.standard,
                                }),
                                zIndex: -1,
                            },

                            // Hover state
                            '&:hover': {
                                borderRadius: 2,
                                '&::before': {
                                    width: '100%',
                                    borderRadius: 2,
                                    opacity: 1,
                                },
                            },

                        }}
                    >
                        <Typography variant="body1">Historia</Typography>
                    </IconButton>

                    <IconButton href="/notifications">
                        <Badge badgeContent={num} color="error">
                            <NotificationsRounded sx={{fontSize: '22px'}}/>
                        </Badge>
                    </IconButton>
                </>
            )}
        </>
    );

const [mobileOpen, setMobileOpen] = useState(false);
const [expandedSection, setExpandedSection] = useState(null);

const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
};

const renderSidebarContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        p: 1
      }}>
        <Typography variant="h6" fontWeight="bold">
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseRounded />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List component="nav" sx={{ flexGrow: 1 }}>
        {isAuthenticated && (
          <>
            <ListItem button href="/main" component="a">
              <ListItemIcon>
                <HomeRounded />
              </ListItemIcon>
              <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Strona główna" />
            </ListItem>

            <ListItem button onClick={() => toggleSection('manage')}>
              <ListItemIcon>
                <CameraIndoor />
              </ListItemIcon>
              <ListItemText primary="Zarządzaj" />
              {expandedSection === 'manage' ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={expandedSection === 'manage'} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button href="/myHomes" component="a" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Home />
                  </ListItemIcon>
                  <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Moje lokacje" />
                </ListItem>

                <ListItem button href="/myDevices" component="a" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Devices />
                  </ListItemIcon>
                  <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Moje urządzenia" />
                </ListItem>

                <ListItem button href="/myRooms" component="a" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <DoorBack />
                  </ListItemIcon>
                  <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Moje pomieszczenia" />
                </ListItem>

                <ListItem button href="/rules" component="a" sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Rule />
                  </ListItemIcon>
                  <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Reguły" />
                </ListItem>
              </List>
            </Collapse>

            <ListItem button href="/dashboard" component="a">
              <ListItemIcon>
                <DonutSmall />
              </ListItemIcon>
              <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Wykresy" />
            </ListItem>

            <ListItem button href="/history" component="a">
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Historia" />
            </ListItem>

            <ListItem button href="/notifications" component="a">
              <ListItemIcon>
                <Badge badgeContent={num} color="error">
                  <NotificationsRounded />
                </Badge>
              </ListItemIcon>
              <ListItemText sx={{color: theme.palette.mode === 'dark' ? 'white' : 'black'}} primary="Powiadomienia" />
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ mt: 'auto', p: 1 }}>
        <Button
          fullWidth
          href={isAuthenticated ? '/logout' : '/login'}
          component="a"
          startIcon={isAuthenticated ? <LogoutRounded /> : <LoginRounded />}
          sx={{
            py: 1.5,
            borderRadius: 1,
            color: isAuthenticated ? 'error.main' : 'success.main',
            '&:hover': {
              bgcolor: isAuthenticated ? 'error.light' : 'success.light',
              color: 'black',
            }
          }}
        >
          {isAuthenticated ? 'Wyloguj się' : 'Zaloguj się'}
        </Button>
      </Box>
    </Box>
  );

    return (
        <StyledAppBar position="sticky" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box href="/" component="a" sx={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        mr: 3
                    }}>
                        <img
                            width={30}
                            style={{margin: 10}}
                            src={theme.palette.mode === 'dark'
                                ? "/images/basic/sensIO_white.png"
                                : "/images/basic/sensIO_black.png"
                            }
                            alt="Logo"
                        />

                        <img
                            height={15}
                            style={{margin: "10px 0 10px 0px"}}
                            src={theme.palette.mode === 'dark'
                                ? "/images/basic/sense_IO_text_white.png"
                                : "/images/basic/sense_IO_text_black.png"
                            }
                            alt="Logo"
                        />

                    </Box>

                    {!isSmallScreen && renderDesktopMenu()}

                    <Box sx={{flexGrow: 1}}/>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <IconButton onClick={toggleTheme}>
                            {theme.palette.mode === 'dark' ? <LightModeRounded/> : <DarkModeRounded/>}
                        </IconButton>

                        {isAuthenticated && (
                            <IconButton href="/userProfile">
                                <Avatar
                                    src={image}
                                    sx={{width: 36, height: 36}}
                                >
                                    <Person/>
                                </Avatar>
                            </IconButton>
                        )}

                        {isSmallScreen ? (
                            <>
                                <IconButton
                                edge="start"

                                aria-label="menu"
                                onClick={handleDrawerToggle}
                                sx={{ ml: 1 }}
                              >
                                <MenuRounded />
                              </IconButton>
                                <Drawer
                                    variant="temporary"
                                    anchor="left"
                                    open={mobileOpen}
                                    onClose={handleDrawerToggle}
                                    ModalProps={{
                                      keepMounted: true, // Better open performance on mobile
                                    }}
                                    sx={{
                                      '& .MuiDrawer-paper': {
                                        width: 280,
                                        boxSizing: 'border-box',
                                      },
                                    }}
                                  >
                                    {renderSidebarContent()}
                                  </Drawer>
                            </>
                        ) : (
                            <IconButton
                                href={isAuthenticated ? '/logout' : '/login'}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    bgcolor: theme.palette.action.selected,
                                    '&:hover': {
                                        bgcolor: theme.palette.action.hover
                                    }
                                }}
                            >
                                {isAuthenticated ? <LogoutRounded/> : <LoginRounded/>}
                                <Typography sx={{ml: 1}}>
                                    {isAuthenticated ? 'Wyloguj' : 'Zaloguj'}
                                </Typography>
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
};

export default CustomNavbar;