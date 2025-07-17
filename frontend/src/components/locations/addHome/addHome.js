import React, {useEffect, useState} from "react";
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
    QuestionMark, AdsClick, Foundation, Roofing
} from "@mui/icons-material";
import client from "../../../client";
import {API_BASE_URL} from "../../../config";
import {useNavigate} from "react-router-dom";
import {MapContainer, Marker, Popup, TileLayer, useMapEvents} from "react-leaflet";

const StyledUploadBox = styled(Paper)(({theme}) => ({
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


function LocationMarker({position, setPosition}) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });


    return position ? (
        <Marker position={position}>
            <Popup>
                <b>Wybrana lokalizacja</b> <br/>
                Długość: {position[0]} <br/>
                Szerokość: {position[1]}
            </Popup>
        </Marker>
    ) : null;
}

const BuildingTypeIcon = ({type}) => {
    const iconStyle = {fontSize: 20, mr: 1};
    switch (type) {
        case 'residential':
            return <Home sx={iconStyle}/>;
        case 'commercial':
            return <Apartment sx={iconStyle}/>;
        case 'industrial':
            return <Factory sx={iconStyle}/>;
        case 'public':
            return <AccountBalance sx={iconStyle}/>;
        case "other":
            return <QuestionMark sx={iconStyle}/>;
        default:
            return <Home sx={iconStyle}/>;
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
        regards: "",
        hasBasement: false,
        hasAttic: false,
        hasElevator: false,
        hasParking: false,
        hasConferenceRoom: false,
        photo: "",
        photoPreview: "",
        location: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const [userLoc, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getUserLocation = () => {
        setIsLoading(true);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
                setIsLoading(false);
            },
            (error) => {
                setLocationError(error.message);
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    const buildingTypes = [
        {value: "residential", label: "Mieszkalny"},
        {value: "commercial", label: "Komercyjny"},
        {value: "industrial", label: "Przemysłowy"},
        {value: "public", label: "Publiczny"},
        {value: "other", label: "Inny"}
    ];


    const steps = ['Informacje podstawowe', 'Dodatkowe informacje', 'Zdjęcie budynku'];

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
        // if (!file) return;
        //
        // if (!file.type.startsWith("image/")) {
        //     setError("Please select an image file");
        //     return;
        // }
        //
        // if (file.size > 5 * 1024 * 1024) {
        //     setError("File is too large (max 5MB)");
        //     return;
        // }

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
        <Box sx={{maxWidth: 900, mx: "auto", p: 3}}>
            <Typography sx={{textAlign: "center", margin: "auto", mb: 2, mt: 1}} variant="h4">
                Dodawanie nowej lokacji
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{mb: 4}}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{mb: 3, borderRadius: 3}}>
                <CardContent>
                    {activeStep === 0 && (
                        <Grid container spacing={3}>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nazwa lokacji"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    error={error && !formData.name}
                                    sx={{mb: 2}}
                                />

                                <TextField
                                    fullWidth
                                    label="Adres"
                                    name="address"
                                    value={formData.address}
                                    sx={{mb: 2}}
                                    error={error && !formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    label="Liczba pięter"
                                    name="floors"
                                    type="number"
                                    value={formData.floors}
                                    sx={{mb:2}}
                                    onChange={(e) => setFormData({...formData, floors: e.target.value})}
                                    inputProps={{min: 1, max: 100}}
                                    required
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Typ budynku</InputLabel>
                                    <Select
                                        name="buildingType"
                                        value={formData.buildingType}
                                        onChange={(e) => setFormData({...formData, buildingType: e.target.value})}
                                        label="Building Type"
                                    >
                                        {buildingTypes.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <BuildingTypeIcon type={type.value}/>
                                                    {type.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                            </Grid>

                            <Grid item xs={12} md={6}>
                                {userLoc && (
                                    <div style={{
                                        height: '400px',
                                        width: '100%',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <MapContainer
                                            center={userLoc} // Domyślne centrum - Warszawa
                                            zoom={13}
                                            style={{height: '100%', width: '100%'}}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <LocationMarker
                                                position={formData.location}
                                                setPosition={(pos) => setFormData({...formData, location: pos})}
                                            />
                                        </MapContainer>
                                    </div>
                                )}
                                <Typography variant="h6" gutterBottom
                                            sx={{mb: 2, mt: 1, height: 40, textAlign: "center"}}>

                                    {formData.location ?
                                        <>
                                            <Button color={"primary"} variant={"outlined"} onClick={() => {
                                                setFormData({...formData, location: ""})
                                            }}>
                                                Usuń lokalizację
                                            </Button>
                                        </> :
                                        <>
                                            <AdsClick sx={{mr: 2}}/>
                                            Wybierz lokalizację na mapie
                                        </>}

                                </Typography>

                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Dodatkowe informacje
                                </Typography>
                                <Divider sx={{mb: 3}}/>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Rok budowy"
                                    name="yearBuilt"
                                    type="number"
                                    sx={{mb: 2}}
                                    value={formData.yearBuilt}
                                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                                    inputProps={{min: 1700, max: new Date().getFullYear()}}
                                />

                                <TextField
                                    fullWidth
                                    label="Powierzchnia (m²)"
                                    name="totalArea"
                                    type="number"
                                    sx={{mb: 2}}
                                    value={formData.totalArea}
                                    onChange={(e) => setFormData({...formData, totalArea: e.target.value})}
                                    inputProps={{min: 0}}
                                />

                                <Grid container >
                                    <Grid item xs={6} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name="hasBasement"
                                                    checked={formData.hasBasement}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        hasBasement: e.target.checked
                                                    })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Foundation sx={{mr: 1, fontSize: 20}}/>
                                                    Piwnica
                                                </Box>
                                            }
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name="hasAttic"
                                                    checked={formData.hasAttic}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        hasAttic: e.target.checked
                                                    })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Roofing sx={{ mr: 1, fontSize: 20 }} />
                                                    Strych
                                                </Box>
                                            }
                                        />
                                    </Grid>

                                </Grid>

                                <Grid container>
                                    <Grid item xs={6} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name="hasElevator"
                                                    checked={formData.hasElevator}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        hasElevator: e.target.checked
                                                    })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Elevator sx={{mr: 1, fontSize: 20}}/>
                                                    Winda
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    name="hasParking"
                                                    checked={formData.hasParking}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        hasParking: e.target.checked
                                                    })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Park sx={{mr: 1, fontSize: 20}}/>
                                                    Parking
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                </Grid>

                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Uwagi"
                                    name="regards"
                                    type="text"
                                    multiline
                                    rows={10}
                                    value={formData.regards}
                                    onChange={(e) => setFormData({...formData, regards: e.target.value})}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 2 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Zdjęcie budynku
                                </Typography>
                                <Divider sx={{mb: 3}}/>
                            </Grid>

                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    style={{display: "none"}}
                                    id="photo-upload"
                                    type="file"
                                    onChange={handleImageUpload}

                                />

                                {formData.photoPreview ? (
                                    <Box sx={{position: 'relative', maxWidth: 400, mx: 'auto'}}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                            badgeContent={
                                                <IconButton
                                                    onClick={handleRemoveImage}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        '&:hover': {bgcolor: 'error.dark'}
                                                    }}
                                                >
                                                    <Delete fontSize="small"/>
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
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        width: '100%'
                                    }}>
                                        <label htmlFor="photo-upload" style={{display: 'contents'}}>
                                            <StyledUploadBox sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                p: 3,
                                                border: '2px dashed #ccc',
                                                borderRadius: 2,
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}>
                                                <CloudUpload color="primary" sx={{fontSize: 48, mb: 2}}/>
                                                <Typography variant="h6" gutterBottom>
                                                    Wgraj zdjęcie
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                                    Kliknij, aby przeglądać zdjęcia z urządzenia
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{mt: 1}}>
                                                    Maks. rozmiar pliku: 5MB
                                                </Typography>
                                            </StyledUploadBox>
                                        </label>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </CardContent>
            </Card>

            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    sx={{minWidth: 120}}
                >
                    Wstecz
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={<CheckCircle/>}
                        size="large"
                        sx={{minWidth: 200}}
                    >
                        Zapisz
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{minWidth: 120}}
                    >
                        Dalej
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
                <Alert severity="success" icon={<CheckCircle fontSize="inherit"/>}>
                    Dodano budynek!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddHome;