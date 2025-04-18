import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import EditableCanvas from "../../editableCanvas/editableCanvas";

const AddHome = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [floors, setFloors] = useState(1);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const steps = ["Podstawowe informacje", "Konfiguracja pięter"];

  const handleNext = () => {
    if (!name.trim()) {
      setError("Nazwa lokacji jest wymagana");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError("");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddFloor = () => {
    setFloors(floors + 1);
  };

  const handleRemoveFloor = (index) => {
    if (floors > 1) {
      setFloors(floors - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send data to your API
    console.log({ name, address, notes, floors });
    setSuccess(true);
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Nowa lokacja
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nazwa lokacji"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  variant="outlined"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Uwagi"
                  variant="outlined"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Konfiguracja pięter
          </Typography>

          {Array.from({ length: floors }, (_, floorIndex) => (
            <Card key={floorIndex} sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                  }}
                >
                  <Typography variant="h6">
                    Piętro {floorIndex + 1}
                  </Typography>
                  {floors > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFloor(floorIndex)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <EditableCanvas floorNumber={floorIndex + 1} />
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddFloor}
            sx={{ mb: 3 }}
          >
            Dodaj piętro
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Wstecz
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            endIcon={<CheckCircleIcon />}
          >
            Zakończ i zapisz
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Dalej
          </Button>
        )}
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Lokacja została pomyślnie dodana!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddHome;