import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  styled, Avatar, Chip
} from "@mui/material";
import {
    Add,
    CheckCircle,
    Edit,
    Delete,
    LocationOn, Search
} from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import {useNavigate} from "react-router-dom";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateX(5px)',
    backgroundColor: theme.palette.action.hover,
  },
  '&.current': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(213,213,213,0.52) ' + '!important',
    borderLeft: `4px solid ${theme.palette.primary.main}`
  }
}));

const UserHomesPage = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await client.get(API_BASE_URL + "myHomes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(response.data);
        setFilteredLocations(response.data);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    token && fetchLocations();
  }, [token]);

  useEffect(() => {
    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLocations(filtered);
    setCurrentPage(1);
  }, [search, locations]);

  const handleSetCurrent = async (homeId) => {
    try {
      await client.put(API_BASE_URL + "myHomes/",
        { location_id: homeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh locations after update
      const updated = locations.map(loc => ({
        ...loc,
        current: loc.home_id === homeId
      }));
      setLocations(updated);
    } catch (error) {
      console.error("Failed to set current location", error);
    }
  };

  const handleDelete = async (homeId) => {
    if(window.confirm("Czy na pewno chcesz usunąć tę lokację?")) {
      try {
        await client.delete(`${API_BASE_URL}myHomes/${homeId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLocations(locations.filter(loc => loc.home_id !== homeId));
      } catch (error) {
        console.error("Failed to delete location", error);
      }
    }
  };

  const navigate= useNavigate()

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1">
                Moje Lokacje
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/addHome"
                sx={{ minWidth: 200 }}
              >
                Nowa Lokacja
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: 'selected.light' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <LocationOn color="primary" fontSize="large" />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6">
                      Aktualna lokacja:
                    </Typography>
                    <Select
                      fullWidth
                      value={locations.find(loc => loc.current)?.home_id || ''}
                      onChange={(e) => handleSetCurrent(e.target.value)}
                    >
                      {locations.map(location => (
                        <MenuItem key={location.home_id} value={location.home_id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Szukaj lokacji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>

<Grid item xs={12}>
  <List
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      overflow: 'hidden',
      p: 0
    }}
  >
    {filteredLocations
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((location) => (
        <StyledListItem
          key={location.home_id}
          className={location.current ? 'current' : ''}
          onClick={() => navigate(`/home/${location.home_id}`)}
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&:last-child': {
              borderBottom: 'none'
            },

          }}
          secondaryAction={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                edge="end"
                href={`/home/${location.home_id}/edit`}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(location.home_id);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: 'rgba(211, 47, 47, 0.08)'
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <ListItemAvatar sx={{ minWidth: 80 }}>
            <Avatar
              variant="rounded"
              src="https://www.colorland.pl/storage/app/uploads/public/a29/0MV/8xL/a290MV8xLmpwZyExY2E4OTk4Zjg1M2ZmNzYxODgyNDhhNmMyZjU1MjI5Ng==.jpg"
              alt={location.name}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1.5,
                boxShadow: 1
              }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {location.name}
                  {location.current && (
                    <Chip
                      label="Current"
                      size="small"
                      color="success"
                      icon={<CheckCircle fontSize="small" />}
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        '& .MuiChip-icon': {
                          fontSize: '1rem',
                          ml: 0.5
                        }
                      }}
                    />
                  )}
                </Typography>
              </Box>
            }
            secondary={
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 0.5
                }}
              >
                <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                {location.address}
              </Typography>
            }
            sx={{ my: 0 }}
          />
        </StyledListItem>
      ))}
  </List>
</Grid>

          <Grid item xs={12}>
            <Pagination
              count={Math.ceil(filteredLocations.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              shape="rounded"
              sx={{ display: 'flex', justifyContent: 'center' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserHomesPage;