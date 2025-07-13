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
    Chip
} from "@mui/material";
import {
    Save as SaveIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Merge as MergeIcon,
    Help as HelpIcon,
    Fullscreen as FullscreenIcon,
    GridOn as GridIcon, KeyboardReturn
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

function isOverlapping(roomA, roomB) {
    return !(
        roomA.x + roomA.width <= roomB.x ||
        roomA.x >= roomB.x + roomB.width ||
        roomA.y + roomA.height <= roomB.y ||
        roomA.y >= roomB.y + roomB.height
    );
}


const RoomEditor = () => {

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const location = useLocation();
    const { floorId } = location.state || {};


    const handleMerge = () => {
        if (selectedRooms.length < 2) return;

        // Pobierz pokoje do połączenia
        const roomsToMerge = rooms.filter(room => selectedRooms.includes(room.id));

        // Wyznacz minimalny prostokąt obejmujący wszystkie pokoje
        const minX = Math.min(...roomsToMerge.map(r => r.x));
        const minY = Math.min(...roomsToMerge.map(r => r.y));
        const maxX = Math.max(...roomsToMerge.map(r => r.x + r.width));
        const maxY = Math.max(...roomsToMerge.map(r => r.y + r.height));

        // Utwórz nowy pokój
        const mergedRoom = {
            id: uuidv4(),
            name: roomsToMerge.map(r => r.name).join(" + "),
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            merged: true
        };

        // Usuń stare pokoje, dodaj nowy
        setRooms([
            ...rooms.filter(room => !selectedRooms.includes(room.id)),
            mergedRoom
        ]);
        setSelectedRooms([mergedRoom.id]);
    };

    const token = localStorage.getItem("access");
    const handleSave = () => {
        // Twoja logika zapisu
        console.log("Save rooms", rooms);
        client.post(API_BASE_URL + "layout_handler/",
            {layout: rooms,
                floorId: floorId},
            {headers: {Authorization: `Bearer ${token}`}}
        )
    };
    console.log(floorId)

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [newRoomSize, setNewRoomSize] = useState(120);
    const lastMousePosition = useRef({x: 0, y: 0});
    const canvasRef = useRef(null);

    useEffect(() => {
        if (Array.isArray(rooms) && rooms.length === 0) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = rect.width / 2 - 60;
                const y = rect.height / 2 - 60;
                addRoom({x, y});
            }
        }
    }, []);


    const handleMouseDown = (e) => {
        if (e.target === canvasRef.current) {
            setIsDragging(true);
            lastMousePosition.current = {x: e.clientX, y: e.clientY};
            setSelectedRoom(null);
        }
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

    const addRoom = (position, size = newRoomSize) => {
        const newRoom = {
            id: uuidv4(),
            name: `Room ${rooms.length + 1}`,
            x: position.x,
            y: position.y,
            width: size,
            height: size,
            merged: false
        };

        // Sprawdź kolizję z istniejącymi pokojami
        const overlaps = rooms.some(room => isOverlapping(room, newRoom));
        if (overlaps) {
            alert("Nowy pokój nachodzi na istniejący. Wybierz inne miejsce.");
            return;
        }

        setRooms([...rooms, newRoom]);
        setSelectedRoom(newRoom.id);
    };

    // Poprawiona funkcja dodawania pokoi z uwzględnieniem transformacji
    const handleAddRoom = (side = "right") => {
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

        switch (side) {
            case "right":
                newX = room.x + room.width; // place to the right edge
                newY = room.y;
                break;
            case "left":
                newX = room.x - newRoomSize; // place to the left edge
                newY = room.y;
                break;
            case "top":
                newX = room.x;
                newY = room.y - newRoomSize; // place above
                break;
            case "bottom":
                newX = room.x;
                newY = room.y + room.height; // place below
                break;
            default:
                break;
        }

        addRoom({x: newX, y: newY}, newRoomSize);
    };


    const deleteRoom = (id) => {
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

        // Sprawdź kolizję z innymi pokojami (pomijając siebie)
        const overlaps = rooms.some(r =>
            r.id !== id && isOverlapping(r, updatedRoom)
        );
        if (overlaps) {
            alert("Zmiana rozmiaru spowoduje nachodzenie na inny pokój.");
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
                backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
                backgroundSize: "20px 20px"
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
                            selected={selectedRooms.includes(room.id)}
                            merged={room.merged}
                            style={{
                                left: room.x,
                                top: room.y,
                                width: room.width,
                                height: room.height
                            }}
                            onClick={() => {
                                setSelectedRoom(room.id)
                                setSelectedRooms(prev =>
                                    prev.includes(room.id)
                                        ? prev.filter(id => id !== room.id)
                                        : [...prev, room.id]
                                );
                            }}
                            onContextMenu={(e) => handleContextMenu(e, room.id)}
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

                            {selectedRoom === room.id && (
                                <>
                                    {/* Przyciski do zmiany rozmiaru */}
                                    <Box sx={{
                                        position: "absolute",
                                        right: 0,
                                        bottom: 0,
                                        display: "flex"
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleResize(room.id, 'width', 20);
                                            }}
                                            sx={{bgcolor: "background.paper"}}
                                        >
                                            <AddIcon fontSize="small"/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleResize(room.id, 'height', 20);
                                            }}
                                            sx={{bgcolor: "background.paper"}}
                                        >
                                            <AddIcon fontSize="small" style={{transform: "rotate(90deg)"}}/>
                                        </IconButton>
                                    </Box>

                                    {/* Przycisk usuwania */}
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRoom(room.id);
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: -12,
                                            right: -12,
                                            bgcolor: "error.main",
                                            color: "white",
                                            "&:hover": {bgcolor: "error.dark"}
                                        }}
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </>
                            )}

                            {room.merged && (
                                <Chip
                                    label="Merged"
                                    size="small"
                                    color="secondary"
                                    sx={{
                                        position: "absolute",
                                        bottom: 4,
                                        right: 4,
                                        fontSize: '0.6rem'
                                    }}
                                />
                            )}
                        </RoomBlock>
                    </React.Fragment>
                ))}
            </Box>

            {/* Kontrolki */}
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

            {/* Panel dodawania */}
            <Paper
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    p: 2,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                <Typography variant="subtitle2">Add Room</Typography>
                <Slider
                    value={newRoomSize}
                    onChange={(e, v) => setNewRoomSize(v)}
                    min={80}
                    max={200}
                    step={10}
                    valueLabelDisplay="auto"
                    sx={{width: 120}}
                />
                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => handleAddRoom("right")}>
                    Add Room to Right
                </Button>

                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => handleAddRoom("left")}>
                    Add Room to Left
                </Button>

                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => handleAddRoom("top")}>
                    Add Room to Top
                </Button>

                <Button variant="contained" startIcon={<AddIcon/>} onClick={() => handleAddRoom("bottom")}>
                    Add Room to Bottom
                </Button>
                <Divider sx={{my: 1}}/>

                <Button
                    variant="outlined"
                    startIcon={<MergeIcon/>}
                    onClick={handleMerge}
                    disabled={!selectedRoom}
                >
                    Merge Rooms
                </Button>
            </Paper>

            {/* Menu kontekstowe */}
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
                <MenuItem onClick={() => {
                    if (contextMenu?.roomId) {
                        deleteRoom(contextMenu.roomId);
                    }
                    setContextMenu(null);
                }}>
                    Delete
                </MenuItem>
            </Menu>

            {/* Help Dialog */}
            <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="sm">
                <DialogTitle>Building Layout Editor Guide</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        <strong>How to use the editor:</strong>
                    </Typography>
                    <ul>
                        <li><Typography>Click and drag to pan the canvas</Typography></li>
                        <li><Typography>Use mouse wheel to zoom in/out</Typography></li>
                        <li><Typography>Click on a room to select it</Typography></li>
                        <li><Typography>Drag the corners to resize rooms</Typography></li>
                        <li><Typography>Right-click for context menu</Typography></li>
                        <li><Typography>Use the controls panel to add new rooms</Typography></li>
                        <li><Typography>Select multiple rooms and click "Merge" to combine them</Typography></li>
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHelp(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RoomEditor;