import {useState, useCallback, useEffect} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Grid,
    IconButton,
    Modal,
    Slider,
    TextField,
    Typography,
    styled, Skeleton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Badge, Tooltip
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocalCafe as CoffeeIcon,
    AttachMoney as DonateIcon,
    Close as CloseIcon,
    Save as SaveIcon, Close, Verified, NewReleases, Mail, OutgoingMail
} from "@mui/icons-material";
import Cropper from "react-easy-crop";
import client from "../../../client.jsx";
import {API_BASE_URL} from "../../../config.jsx";

// Styled components
const ProfileContainer = styled(Container)(({theme}) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const ProfileCard = styled(Card)(({theme}) => ({
    marginBottom: theme.spacing(3),
    border: "1px solid #00000020",
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[2],
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)'
    }
}));

const AvatarContainer = styled('div')({
    position: 'relative',
    width: 150,
    height: 150,
    margin: '0 auto',
    cursor: 'pointer'
});

const AvatarOverlay = styled('div')(({theme}) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
        opacity: 1
    }
}));

const CropContainer = styled('div')({
    position: 'relative',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden'
});

// Utility function to crop image
async function getCroppedImg(imageSrc, croppedAreaPixels) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x, croppedAreaPixels.y,
                croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0,
                canvas.width, canvas.height
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error("Błąd konwersji obrazu"));
                }
                resolve(blob);
            }, "image/png");
        };

        image.onerror = (error) => reject(error);
    });
}


export default function UserProfile() {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const token = localStorage.getItem("access");
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true); // Start loading
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setIsLoading(false); // Stop loading regardless of success/error
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);

    const handleDeleteAccount = () => {
        if (window.confirm("Czy na pewno chcesz usunąć swoje konto? Ta akcja jest nieodwracalna.")) {
            console.log("Konto usunięte");
            // Add actual delete account logic here
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setUser({
            ...user,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleEdit = async (e) => {

        if (isEditing) {
            try {
                const response = await client.put(API_BASE_URL + "user/", {
                    email: user.email,
                    surname: user.surname,
                    name: user.name,
                    telephone: user.telephone,
                    address: user.address,
                }, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        }
        setIsEditing(!isEditing)
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            console.error("Brak obrazu lub danych przycięcia.");
            return;
        }

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const imageType = croppedBlob.type || "image/png";
            const fileExtension = imageType === "image/png" ? "png" : "jpg";
            const croppedFile = new File([croppedBlob], `profile_picture.${fileExtension}`, {type: imageType});
            const formData = new FormData();
            formData.append("profile_picture", croppedFile);

            const response = await client.post(API_BASE_URL + "user/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setCroppedImage(response.data.profile_picture.toString().slice(15));
            setUser({...user, profile_picture: response.data.profile_picture.toString().slice(15)});
            localStorage.setItem("image_set", response.data.profile_picture.toString().slice(15));
            setShowCropModal(false);
        } catch (error) {
            console.error("Error cropping or uploading:", error);
        }
    };

    return (
        <ProfileContainer maxWidth="md">

            {/* Profile Header */}
            <Box sx={{textAlign: 'center', mb: 4, mt:1 }} >

                <AvatarContainer>
                    {isLoading ? (
                        <Skeleton
                            variant="circular"
                            width={150}
                            height={150}
                            sx={{
                                bgcolor: 'grey.900',
                                transform: 'none', // Disable wave animation
                                borderRadius: '50%'
                            }}
                        />
                    ) : (
                        <Badge anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }} badgeContent={user.isVerified?
                          <Tooltip placement="right" title="Zweryfikowano" color={"primary"} arrow>
                            <Verified fontSize="large" />
                          </Tooltip>:
                            <Tooltip placement="right" title="Niezweryfikowano"  arrow>
                            <NewReleases fontSize="large" />
                          </Tooltip>
                        }>

                            <Avatar
                                src={croppedImage
                                    ? croppedImage
                                    : user.profile_picture
                                        ? user.profile_picture.toString().slice(15)
                                        : "/images/basic/user_no_picture.png"}
                                alt="Profil"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    border: '3px solid white',
                                    boxShadow: 3
                                }}
                            />
                            <AvatarOverlay onClick={() => document.getElementById("fileInput").click()}>
                                <EditIcon fontSize="large"/>
                                <Typography variant="caption">Zmień zdjęcie</Typography>
                            </AvatarOverlay>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{display: "none"}}
                                onChange={handleImageUpload}
                            /></Badge>
                    )}
                </AvatarContainer>


                {isLoading ? (
                    <>
                        <Skeleton
                            variant="text"
                            width={200}
                            height={50}
                            sx={{mx: 'auto', mt: 2}}
                        />
                        <Skeleton
                            variant="text"
                            width={160}
                            height={30}
                            sx={{mx: 'auto'}}
                        />
                    </>
                ) : (
                    <>
                        <Typography variant="h4" component="h1" sx={{mt: 2, fontWeight: 600}}>
                            {user.username}
                        </Typography>

                        <Typography variant="subtitle1" color="text.secondary">
                            {user.email}
                        </Typography>
                    </>
                )}
            </Box>

            {/* Personal Information Card */}
            <ProfileCard>
                <CardHeader
                    title="Informacje osobiste"
                    action={
                        <>
                            {!isEditing ? null : <Close sx={{mr: 2, cursor: "pointer"}} onClick={() => {
                                setIsEditing(!isEditing)
                            }}/>}

                            <Button
                                startIcon={isEditing ? <SaveIcon/> : <EditIcon/>}
                                variant={isEditing ? "contained" : "outlined"}
                                color={isEditing ? "success" : "primary"}
                                onClick={handleEdit}
                            >
                                {isEditing ? "Zapisz" : "Edytuj"}
                            </Button>

                            {!user.isVerified &&
                            <Button
                                startIcon={<OutgoingMail/>}
                                variant={ "outlined"}
                                color={"primary"}
                                onClick={handleEdit}
                                sx={{ml: 1}}
                            >
                                Zweryfikuj
                            </Button>
                }

                        </>
                    }
                />
                <Divider/>

                <CardContent>
                    <Grid container spacing={3}>
                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                fullWidth
                                label="Imię"
                                name="name"
                                value={user.name || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                fullWidth
                                label="Nazwisko"
                                name="surname"
                                value={user.surname || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={user.email || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                fullWidth
                                label="Numer telefonu"
                                name="telephone"
                                value={user.telephone || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid size={{xs:12, sm:6}}>
                            <TextField
                                fullWidth
                                label="Adres"
                                name="address"
                                value={user.address || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </ProfileCard>

            <ProfileCard sx={{borderLeft: '4px solid', borderLeftColor: 'error.main'}}>
                <CardContent>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <DeleteIcon color="error" sx={{fontSize: 40, mr: 2}}/>
                        <Box>
                            <Typography variant="h6" component="h3">
                                Usuwanie konta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną trwale usunięte.
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon/>}
                            onClick={handleClickOpen}
                        >
                            Usuń konto
                        </Button>
                    </Box>
                </CardContent>
            </ProfileCard>

            <Modal open={showCropModal} onClose={() => setShowCropModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 500,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 3,
                    outline: 'none'
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">Przytnij zdjęcie profilowe</Typography>
                        <IconButton onClick={() => setShowCropModal(false)}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                    <CropContainer>
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </CropContainer>
                    <Box sx={{mt: 2, px: 2}}>
                        <Typography gutterBottom>Powiększenie</Typography>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e, value) => setZoom(value)}
                            valueLabelDisplay="auto"
                        />
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2}}>
                        <Button variant="outlined" onClick={() => setShowCropModal(false)}>
                            Anuluj
                        </Button>
                        <Button variant="contained" onClick={handleCropSave} startIcon={<SaveIcon/>}>
                            Zapisz
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Czy na pewno chcesz usunąć konto?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Operacja jest nieodwracalna, a wszystkie
                        Twoje dane zostaną usunięte! Czy chcesz kontynuować?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Anuluj</Button>
                    <Button variant={"contained"} onClick={handleDeleteAccount} autoFocus>
                        Usuń konto
                    </Button>
                </DialogActions>
            </Dialog>
        </ProfileContainer>
    );
}