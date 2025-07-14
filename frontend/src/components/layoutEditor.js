import React, {useState, useRef, useEffect} from "react";
import {
    Box,
    Button,
    IconButton,
    TextField,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Paper,
    Divider,
    Menu,
    MenuItem,
    Slider,
    Chip,
    Alert, Badge
} from "@mui/material";
import {
    Save as SaveIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Help as HelpIcon,
    Fullscreen as FullscreenIcon,
    KeyboardReturn, VisibilityOff, Visibility, ContentCopy, GridView, Straighten
} from "@mui/icons-material";
import {v4 as uuidv4} from "uuid";
import {styled} from "@mui/material/styles";
import client from "../client";
import {API_BASE_URL} from "../config";
import {useLocation} from "react-router-dom";

const RoomBlock = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'merged'
})(({theme, selected, merged}) => ({
    position: "absolute",
    minWidth: 120,
    minHeight: 120,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows[selected ? 6 : 2],
    border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: merged
        ? theme.palette.action.selected
        : selected
            ? theme.palette.primary.light
            : theme.palette.background.paper,
    "&:hover": {
        transform: "scale(1.02)",
        boxShadow: theme.shadows[8],
        zIndex: 10
    },
    cursor: "pointer",
    zIndex: selected ? 5 : 1
}));

const WallButton = styled(IconButton)(({theme, active}) => ({
    position: "absolute",
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
    color: active ? theme.palette.common.white : theme.palette.text.primary,
    width: 24,
    height: 24,
    minWidth: 24,
    "&:hover": {
        backgroundColor: active ? theme.palette.primary.dark : theme.palette.grey[400]
    }
}));

function isOverlapping(roomA, roomB) {
    return !(
        roomA.x + roomA.width <= roomB.x ||
        roomA.x >= roomB.x + roomB.width ||
        roomA.y + roomA.height <= roomB.y ||
        roomA.y >= roomB.y + roomB.height
    );
}

function hasAdjacentRoom(rooms, room, direction) {
    const padding = 5; // Small tolerance for adjacency

    return rooms.some(otherRoom => {
        if (otherRoom.id === room.id) return false;

        switch (direction) {
            case 'top':
                return (
                    Math.abs(otherRoom.y + otherRoom.height - room.y) <= padding &&
                    ((otherRoom.x < room.x + room.width && otherRoom.x + otherRoom.width > room.x) ||
                        (room.x < otherRoom.x + otherRoom.width && room.x + room.width > otherRoom.x))
                );
            case 'right':
                return (
                    Math.abs(otherRoom.x - (room.x + room.width)) <= padding &&
                    ((otherRoom.y < room.y + room.height && otherRoom.y + otherRoom.height > room.y) ||
                        (room.y < otherRoom.y + otherRoom.height && room.y + room.height > otherRoom.y)
                    ));
            case 'bottom':
                return (
                    Math.abs(otherRoom.y - (room.y + room.height)) <= padding &&
                    ((otherRoom.x < room.x + room.width && otherRoom.x + otherRoom.width > room.x) ||
                        (room.x < otherRoom.x + otherRoom.width && room.x + room.width > otherRoom.x)
                    ));
            case 'left':
                return (
                    Math.abs(otherRoom.x + otherRoom.width - room.x) <= padding &&
                    ((otherRoom.y < room.y + room.height && otherRoom.y + otherRoom.height > room.y) ||
                        (room.y < otherRoom.y + otherRoom.height && room.y + room.height > otherRoom.y))
                );
            default:
                return false;
        }
    });
}

function canDeleteRoom(rooms, roomId) {
    const roomToDelete = rooms.find(r => r.id === roomId);
    if (!roomToDelete) return false;
    if (rooms.length <= 2) return true;
    // Check all adjacent rooms
    const adjacentRooms = rooms.filter(otherRoom => {
        if (otherRoom.id === roomId) return false;
        return (
            hasAdjacentRoom([roomToDelete], otherRoom, 'top') ||
            hasAdjacentRoom([roomToDelete], otherRoom, 'right') ||
            hasAdjacentRoom([roomToDelete], otherRoom, 'bottom') ||
            hasAdjacentRoom([roomToDelete], otherRoom, 'left')
        );
    });

    // For each adjacent room, check if it would have all walls unconnected after deletion
    for (const adjRoom of adjacentRooms) {
        let connectedWalls = 0;

        ['top', 'right', 'bottom', 'left'].forEach(direction => {
            if (hasAdjacentRoom(
                rooms.filter(r => r.id !== roomId),
                adjRoom,
                direction
            )) {
                connectedWalls++;
            }
        });

        if (connectedWalls === 0) {
            return false;
        }
    }

    return true;
}

const RoomEditor = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [hoveredSide, setHoveredSide] = useState(null);
    const [error, setError] = useState(null);

    const location = useLocation();
    const {floorId, layout} = location.state || {};
    const token = localStorage.getItem("access");
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [newRoomSize, setNewRoomSize] = useState(120);
    const lastMousePosition = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);
    const [blockSize, setBlockSize] = useState({width: 120, height: 120});
    const [showMeasurements, setShowMeasurements] = useState(true);
    const [roomVisibility, setRoomVisibility] = useState({});
    const [showGrid, setShowGrid] = useState(true);

    useEffect(() => {
        if (layout && layout.length > 0) {
            const positions = layout.map(room => ({
                id: room.room_id,
                name: room.name,
                x: room.position.x,
                y: room.position.y,
                width: room.position.width,
                height: room.position.height
            }));
            setRooms(positions);
            if (positions.length > 0) {
                setBlockSize({
                    width: positions[0].width,
                    height: positions[0].height
                });
            }
        }
        console.log(location.state)
    }, [layout]);

    const handleMouseDown = (e) => {
        if (e.target === canvasRef.current) {
            setIsDragging(true);
            lastMousePosition.current = {x: e.clientX, y: e.clientY};
            setSelectedRoom(null);
        }
    };

    const handleSave = () => {
        client.post(API_BASE_URL + "layout_handler/",
            {
                layout: rooms,
                floorId: floorId
            },
            {
                headers: {Authorization: `Bearer ${token}`}
            }
        );
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;

        setOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));

        lastMousePosition.current = {x: e.clientX, y: e.clientY};
    };

    const handleMouseUp = () => setIsDragging(false);

    const addRoom = (position, size = newRoomSize, direction = null) => {
        const newRoom = {
            id: uuidv4(),
            name: `Pokój ${rooms.length + 1}`,
            x: position.x,
            y: position.y,
            width: size,
            height: size
        };

        // Check collision with existing rooms
        const overlaps = rooms.some(room => isOverlapping(room, newRoom));
        if (overlaps) {
            setError("Nowy pokój nachodzi na istniejący. Wybierz inne miejsce.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        // If adding adjacent to another room, check if that wall is free
        if (direction && selectedRoom) {
            const parentRoom = rooms.find(r => r.id === selectedRoom);
            if (parentRoom && hasAdjacentRoom(rooms, parentRoom, direction)) {
                setError(`Nie można dodać pokoju - ściana ${direction} jest już zajęta.`);
                setTimeout(() => setError(null), 3000);
                return;
            }
        }

        setRooms([...rooms, newRoom]);
        setSelectedRoom(newRoom.id);
    };

    const toggleRoomVisibility = (roomId) => {
        setRoomVisibility(prev => ({
            ...prev,
            [roomId]: !prev[roomId]
        }));
    };

    const handleAddRoom = (direction) => {
        if (!selectedRoom) {
            // If no room selected, fallback to center
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const canvasX = (centerX - offset.x) / scale;
            const canvasY = (centerY - offset.y) / scale;

            addRoom({
                x: canvasX - newRoomSize / 2,
                y: canvasY - newRoomSize / 2
            }, newRoomSize);
            return;
        }

        const room = rooms.find(r => r.id === selectedRoom);
        if (!room) return;

        let newX = room.x;
        let newY = room.y;

        switch (direction) {
            case "right":
                newX = room.x + room.width;
                newY = room.y;
                break;
            case "left":
                newX = room.x - newRoomSize;
                newY = room.y;
                break;
            case "top":
                newX = room.x;
                newY = room.y - newRoomSize;
                break;
            case "bottom":
                newX = room.x;
                newY = room.y + room.height;
                break;
            default:
                break;
        }

        addRoom({x: newX, y: newY}, newRoomSize, direction);
    };

    const deleteRoom = (id) => {
        if (!canDeleteRoom(rooms, id)) {
            setError("Nie można usunąć pokoju - spowodowałoby to izolację sąsiednich pomieszczeń.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setRooms(rooms.filter(room => room.id !== id));
        if (selectedRoom === id) setSelectedRoom(null);
    };

    const updateRoom = (id, updates) => {
        setRooms(rooms?.map(room =>
            room.id === id ? {...room, ...updates} : room
        ));
    };

    const handleContextMenu = (e, roomId) => {
        e.preventDefault();
        setContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
            roomId
        });
    };

    const handleResize = (id, axis, amount) => {
        const room = rooms.find(r => r.id === id);
        if (!room) return;

        const newSize = Math.max(100, room[axis] + amount);
        const updatedRoom = {...room, [axis]: newSize};

        // Check collision with other rooms (excluding self)
        const overlaps = rooms.some(r =>
            r.id !== id && isOverlapping(r, updatedRoom)
        );
        if (overlaps) {
            setError("Zmiana rozmiaru spowoduje nachodzenie na inny pokój.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        updateRoom(id, {[axis]: newSize});
    };

    return (
        <Box
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
                position: "relative",
                width: "100%",
                height: "calc(100vh - 64px)",
                overflow: "hidden",
                backgroundColor: "background.default",
                cursor: isDragging ? "grabbing" : "grab",
                backgroundImage: showGrid
                    ? `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`
                    : 'none',
                backgroundSize: `${20 * scale}px ${20 * scale}px`
            }}
        >
            {/* Pokój */}
            <Box
                sx={{
                    position: "absolute",
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: "0 0",
                    willChange: "transform"
                }}
            >
                {rooms?.map(room => (
                    <React.Fragment key={room.id}>
                        <RoomBlock
                            selected={selectedRoom === room.id}
                            style={{
                                left: room.x,
                                top: room.y,
                                width: room.width,
                                height: room.height
                            }}
                            onClick={() => {
                                setSelectedRoom(room.id);
                                setBlockSize({
                                    width: room.width,
                                    height: room.height
                                });
                            }}
                            onContextMenu={(e) => handleContextMenu(e, room.id)}
                            onMouseLeave={() => setHoveredSide(null)}
                        >
                            <TextField
                                value={room.name}
                                onChange={(e) => updateRoom(room.id, {name: e.target.value})}
                                variant="standard"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiInput-root": {
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        "&:before": {borderBottom: "none"}
                                    }
                                }}
                            />

                            {showMeasurements && (
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    fontSize: '0.7rem',
                                    color: 'text.secondary'
                                }}>
                                    {Math.round(room.width)}x{Math.round(room.height)}
                                </Box>
                            )}

                            {selectedRoom === room.id && (
                                <>
                                    {/* Wall buttons for adding adjacent rooms */}
                                    {['top', 'right', 'bottom', 'left'].map(direction => {
                                        const hasAdjacent = hasAdjacentRoom(rooms, room, direction);
                                        return (
                                            <WallButton
                                                key={direction}
                                                active={hoveredSide === direction}
                                                disabled={hasAdjacent}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddRoom(direction);
                                                }}
                                                onMouseEnter={() => setHoveredSide(direction)}
                                                onMouseLeave={() => setHoveredSide(null)}
                                                sx={{
                                                    ...(direction === 'top' && {
                                                        top: -12,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)'
                                                    }),
                                                    ...(direction === 'right' && {
                                                        right: -12,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)'
                                                    }),
                                                    ...(direction === 'bottom' && {
                                                        bottom: -12,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)'
                                                    }),
                                                    ...(direction === 'left' && {
                                                        left: -12,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)'
                                                    })
                                                }}
                                            >
                                                <AddIcon fontSize="small"/>
                                            </WallButton>
                                        );
                                    })}

                                </>
                            )}
                        </RoomBlock>
                    </React.Fragment>
                ))}
            </Box>

            {/* Error message */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 20,
                        width: "auto",
                        maxWidth: "80%"
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Controls */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    display: "flex",
                    gap: 1,
                    zIndex: 10
                }}
            >
                <Tooltip title="Zoom in">
                    <IconButton
                        onClick={() => setScale(prev => Math.min(prev * 1.2, 2))}
                        color="primary"
                        sx={{bgcolor: "background.paper"}}
                    >
                        <ZoomInIcon/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Zoom out">
                    <IconButton
                        onClick={() => setScale(prev => Math.max(prev * 0.8, 0.3))}
                        color="primary"
                        sx={{bgcolor: "background.paper"}}
                    >
                        <ZoomOutIcon/>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Reset view">
                    <IconButton
                        onClick={() => {
                            setScale(1);
                            setOffset({x: 0, y: 0});
                        }}
                        color="primary"
                        sx={{bgcolor: "background.paper"}}
                    >
                        <FullscreenIcon/>
                    </IconButton>
                </Tooltip>
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    display: "flex",
                    gap: 1,
                    zIndex: 10
                }}
            >
                <Button
                    variant={"contained"}
                    onClick={() => window.history.go(-1)}
                >
                    <KeyboardReturn/>
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveIcon/>}
                    onClick={handleSave}
                    sx={{
                        bgcolor: "success.main",
                        "&:hover": {bgcolor: "success.dark"}
                    }}
                >
                    Zapisz
                </Button>

                <Tooltip title="Help">
                    <IconButton
                        onClick={() => setShowHelp(true)}
                        sx={{bgcolor: "background.paper"}}
                    >
                        <HelpIcon/>
                    </IconButton>
                </Tooltip>
            </Box>

            <Paper
                sx={{
                    position: "absolute",
                    top: 80,
                    left: 16,
                    p: 1,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >
                <Tooltip title="Toggle Grid">
                    <IconButton onClick={() => setShowGrid(!showGrid)} size="small">
                        <Badge color="primary" variant="dot" invisible={showGrid}>
                            <GridView fontSize="small"/>
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Toggle Measurements">
                    <IconButton onClick={() => setShowMeasurements(!showMeasurements)} size="small">
                        <Badge color="primary" variant="dot" invisible={showMeasurements}>
                            <Straighten fontSize="small"/>
                        </Badge>
                    </IconButton>
                </Tooltip>

                {selectedRoom && (
                    <>
                        <Tooltip title="Toggle Room Visibility">
                            <IconButton
                                onClick={() => toggleRoomVisibility(selectedRoom)}
                                size="small"
                            >
                                {roomVisibility[selectedRoom] === false ? (
                                    <VisibilityOff fontSize="small"/>
                                ) : (
                                    <Visibility fontSize="small"/>
                                )}
                            </IconButton>
                        </Tooltip>

                    </>
                )}
            </Paper>

            {rooms.length < 1 &&
                (<Button
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        p: 1,
                        zIndex: 10,

                    }}
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => handleAddRoom("right")}
                    disabled={selectedRoom && hasAdjacentRoom(rooms, rooms.find(r => r.id === selectedRoom), 'right')}
                >
                    Nowy pokój
                </Button>)}

            {rooms.length >= 1 && selectedRoom && (
                <Paper
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        p: 2,
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 200
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="subtitle1">Edycja pokoju</Typography>
                    </Box>

                    <Divider/>

                    <Typography variant="body2">Szerokość:</Typography>
                    <Slider
                        value={blockSize.width}
                        onChange={(e, value) => {
                            setBlockSize(prev => ({...prev, width: value}));
                            handleResize(selectedRoom, 'width', value - rooms.find(r => r.id === selectedRoom).width);
                        }}
                        min={80}
                        max={300}
                        step={10}
                        valueLabelDisplay="auto"
                    />


                    <Typography variant="body2">Wysokość:</Typography>
                    <Slider
                        value={blockSize.height}
                        onChange={(e, value) => {
                            setBlockSize(prev => ({...prev, height: value}));
                            handleResize(selectedRoom, 'height', value - rooms.find(r => r.id === selectedRoom).height);
                        }}
                        min={80}
                        max={300}
                        step={10}
                        valueLabelDisplay="auto"
                    />

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon/>}
                        onClick={() => deleteRoom(selectedRoom)}
                        size="small"
                    >
                        Usuń
                    </Button>
                </Paper>
            )}

            {/* Context menu */}
            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined
                }
            >
                <MenuItem onClick={() => {
                    if (contextMenu?.roomId) {
                        setSelectedRoom(contextMenu.roomId);
                    }
                    setContextMenu(null);
                }}>
                    Edytuj
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (contextMenu?.roomId) {
                            deleteRoom(contextMenu.roomId);
                        }
                        setContextMenu(null);
                    }}
                    disabled={contextMenu?.roomId && !canDeleteRoom(rooms, contextMenu.roomId)}
                >
                    Usuń
                </MenuItem>
            </Menu>

            {/* Help Dialog */}
            <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="sm">
                <DialogTitle>Instrukcja edytora układu pomieszczeń</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        <strong>Jak korzystać z edytora:</strong>
                    </Typography>
                    <ul>
                        <li><Typography>Kliknij i przeciągnij, aby przesunąć widok</Typography></li>
                        <li><Typography>Użyj kółka myszy, aby przybliżyć/oddalić</Typography></li>
                        <li><Typography>Kliknij na pokój, aby go wybrać</Typography></li>
                        <li><Typography>Użyj przycisków w rogach, aby zmienić rozmiar</Typography></li>
                        <li><Typography>Kliknij prawym przyciskiem myszy, aby otworzyć menu kontekstowe</Typography>
                        </li>
                        <li><Typography>Użyj przycisków "+" na ścianach, aby dodać sąsiedni pokój</Typography></li>
                        <li><Typography>Przyciski "+" są wyłączone, gdy ściana jest już zajęta</Typography></li>
                        <li><Typography>Nie można usunąć pokoju, jeśli spowodowałoby to izolację sąsiednich
                            pomieszczeń</Typography></li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHelp(false)}>Zamknij</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RoomEditor;