import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  InputAdornment,
  Badge,
  styled
} from "@mui/material";
import {
  CheckCircle,
  CloudUpload,
  Delete,
  Home,
  Apartment,
  Factory,
  AccountBalance,
  Elevator,
  Park,
  MeetingRoom,
  PhotoCamera
} from "@mui/icons-material";
import client from "../../../client";
import { API_BASE_URL } from "../../../config";
import { useNavigate } from "react-router-dom";

const StyledUploadBox = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

const BuildingTypeIcon = ({ type }) => {
  const iconStyle = { fontSize: 20, mr: 1 };
  switch (type) {
    case 'residential': return <Home sx={iconStyle} />;
    case 'commercial': return <Apartment sx={iconStyle} />;
    case 'industrial': return <Factory sx={iconStyle} />;
    case 'public': return <AccountBalance sx={iconStyle} />;
    default: return <Home sx={iconStyle} />;
  }
};

const AddHome = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    yearBuilt: "",
    buildingType: "residential",
    totalArea: "",
    floors: 1,
    hasBasement: false,
    hasAttic: false,
    hasElevator: false,
    hasParking: false,
    hasConferenceRoom: false,
    photo: null,
    photoPreview: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const buildingTypes = [
    { value: "residential", label: "Residential Building" },
    { value: "commercial", label: "Commercial Building" },
    { value: "industrial", label: "Industrial Facility" },
    { value: "public", label: "Public Institution" }
  ];

  const steps = ['Basic Information', 'Building Details', 'Photo Upload'];

  const handleNext = () => {
    if (activeStep === 0 && (!formData.name || !formData.address)) {
      setError("Building name and address are required");
      return;
    }
    if (activeStep === 1 && formData.floors < 1) {
      setError("Number of floors must be at least 1");
      return;
    }
    setError("");
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoPreview: ""
    }));
  };

  const handleSubmit = async () => {
    if (!formData.photo) {
      setError("Building photo is required");
      return;
    }

    const formPayload = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === "photo") {
        if (formData.photo) formPayload.append("photo", formData.photo);
      } else {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      await client.post(API_BASE_URL + "myHomes/", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });
      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Error saving building data");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Add New Building
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Building Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Building Type</InputLabel>
                  <Select
                    name="buildingType"
                    value={formData.buildingType}
                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                    label="Building Type"
                  >
                    {buildingTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BuildingTypeIcon type={type.value} />
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year Built"
                  name="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Building Specifications
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Area (m²)"
                  name="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Floors"
                  name="floors"
                  type="number"
                  value={formData.floors}
                  onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                  inputProps={{ min: 1, max: 100 }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  Building Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="hasBasement"
                          checked={formData.hasBasement}
                          onChange={(e) => setFormData({ ...formData, hasBasement: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {/*<Basement sx={{ mr: 1, fontSize: 20 }} />*/}
                          Basement
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="hasAttic"
                          checked={formData.hasAttic}
                          onChange={(e) => setFormData({ ...formData, hasAttic: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {/*<Attic sx={{ mr: 1, fontSize: 20 }} />*/}
                          Attic
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="hasElevator"
                          checked={formData.hasElevator}
                          onChange={(e) => setFormData({ ...formData, hasElevator: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Elevator sx={{ mr: 1, fontSize: 20 }} />
                          Elevator
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="hasParking"
                          checked={formData.hasParking}
                          onChange={(e) => setFormData({ ...formData, hasParking: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Park sx={{ mr: 1, fontSize: 20 }} />
                          Parking
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Building Photo
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="photo-upload"
                  type="file"
                  onChange={handleImageUpload}
                />

                {formData.photoPreview ? (
                  <Box sx={{ position: 'relative', maxWidth: 400, mx: 'auto' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      badgeContent={
                        <IconButton
                          onClick={handleRemoveImage}
                          size="small"
                          sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Avatar
                        src={formData.photoPreview}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          aspectRatio: '16/9',
                          borderRadius: 3,
                          boxShadow: 3
                        }}
                        variant="rounded"
                      />
                    </Badge>
                  </Box>
                ) : (
                  <label htmlFor="photo-upload">
                    <StyledUploadBox>
                      <PhotoCamera color="primary" sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Building Photo
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Drag and drop an image here, or click to browse
                      </Typography>
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUpload />}
                      >
                        Select Image
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Max file size: 5MB
                      </Typography>
                    </StyledUploadBox>
                  </label>
                )}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ minWidth: 120 }}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            endIcon={<CheckCircle />}
            size="large"
            sx={{ minWidth: 200 }}
          >
            Save Building
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ minWidth: 120 }}
          >
            Next
          </Button>
        )}
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => {
          setSuccess(false);
          navigate("/myHomes");
        }}
      >
        <Alert severity="success" icon={<CheckCircle fontSize="inherit" />}>
          Building successfully added!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddHome;