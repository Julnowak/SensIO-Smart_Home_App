import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Typography
} from "@mui/material";
import {
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import client from "../../client";
import { API_BASE_URL } from "../../config";

const RoomBlock = ({
  room_id,
  name,
  position,
  onAdd,
  onRename,
  onDelete,
  isPositionOccupied,
  selectedBlock,
  setSelectedBlock
}) => {
  const isSelected = selectedBlock === room_id;

  return (
    <Box
      sx={{
        position: "absolute",
        top: position.y,
        left: position.x,
        width: 100,
        height: 100,
        bgcolor: isSelected ? "primary.light" : "background.paper",
        border: `2px solid ${isSelected ? "primary.main" : "divider"}`,
        borderRadius: 1,
        p: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "scale(1.02)"
        },
        cursor: "pointer",
        zIndex: isSelected ? 2 : 1
      }}
      onClick={() => setSelectedBlock(room_id)}
    >
      <TextField
        value={name}
        onChange={(e) => onRename(room_id, e.target.value)}
        variant="standard"
        size="small"
        fullWidth
        sx={{
          "& .MuiInputBase-input": {
            textAlign: "center",
            fontWeight: "bold"
          },
          "& .MuiInput-root:before": {
            borderBottom: "none"
          },
          "& .MuiInput-root:hover:not(.Mui-disabled):before": {
            borderBottom: "none"
          }
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% + 40px)",
          height: "calc(100% + 40px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pointerEvents: "none"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tooltip title="Add room above" TransitionComponent={Zoom}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(room_id, "top");
                }}
                disabled={isPositionOccupied({ x: position.x, y: position.y - 120 })}
                sx={{
                  pointerEvents: "auto",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  visibility: isSelected ? "visible" : "hidden"
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Tooltip title="Add room to the left" TransitionComponent={Zoom}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(room_id, "left");
                }}
                disabled={isPositionOccupied({ x: position.x - 120, y: position.y })}
                sx={{
                  pointerEvents: "auto",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  visibility: isSelected ? "visible" : "hidden"
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Add room to the right" TransitionComponent={Zoom}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(room_id, "right");
                }}
                disabled={isPositionOccupied({ x: position.x + 120, y: position.y })}
                sx={{
                  pointerEvents: "auto",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  visibility: isSelected ? "visible" : "hidden"
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tooltip title="Add room below" TransitionComponent={Zoom}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(room_id, "bottom");
                }}
                disabled={isPositionOccupied({ x: position.x, y: position.y + 120 })}
                sx={{
                  pointerEvents: "auto",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  visibility: isSelected ? "visible" : "hidden"
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {isSelected && (
        <Tooltip title="Delete room" TransitionComponent={Zoom}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room_id);
            }}
            sx={{
              position: "absolute",
              top: -12,
              right: -12,
              bgcolor: "error.main",
              color: "error.contrastText",
              "&:hover": { bgcolor: "error.dark" }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const EditableCanvas = ({ layout, floor_id }) => {
  const [blocks, setBlocks] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    setScale((prevScale) => {
      let newScale = e.deltaY > 0 ? prevScale / zoomFactor : prevScale * zoomFactor;
      return Math.max(0.5, Math.min(newScale, 2));
    });
  };

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      setSelectedBlock(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePosition.current.x;
    const dy = e.clientY - lastMousePosition.current.y;

    setOffset((prevOffset) => ({
      x: prevOffset.x + dx,
      y: prevOffset.y + dy,
    }));

    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (layout && layout.length > 0) {
      setBlocks(layout);
    } else {
      setBlocks([{
        room_id: uuidv4(),
        name: "Main Room",
        position: { x: 0, y: 0 },
        floor: floor_id
      }]);
    }

    const canvas = canvasRef.current;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [floor_id, layout]);

  const isPositionOccupied = (newPosition) => {
    return blocks.some(block =>
      Math.abs(block.position.x - newPosition.x) < 100 &&
      Math.abs(block.position.y - newPosition.y) < 100
    );
  };

  const handleAddBlock = (room_id, direction) => {
    const parent = blocks.find(b => b.room_id === room_id);
    if (!parent) return;

    let newPosition = { ...parent.position };
    const spacing = 120; // Consistent spacing between rooms

    switch (direction) {
      case "top":
        newPosition.y -= spacing;
        break;
      case "bottom":
        newPosition.y += spacing;
        break;
      case "left":
        newPosition.x -= spacing;
        break;
      case "right":
        newPosition.x += spacing;
        break;
      default:
        return;
    }

    if (!isPositionOccupied(newPosition)) {
      const newBlock = {
        room_id: uuidv4(),
        name: `Room ${blocks.length + 1}`,
        position: newPosition,
        parent: room_id,
        floor: floor_id
      };

      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setSelectedBlock(newBlock.room_id);
    }
  };

  const handleRenameBlock = (room_id, newName) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(b =>
        b.room_id === room_id ? { ...b, name: newName } : b
      )
    );
  };

  const handleDeleteBlock = (room_id) => {
    setBlocks(prevBlocks => prevBlocks.filter(b => b.room_id !== room_id));
    setSelectedBlock(null);
  };

  const handleAddInitialBlock = () => {
    const newBlock = {
      room_id: uuidv4(),
      name: `Room ${blocks.length + 1}`,
      position: { x: 0, y: 0 },
      floor: floor_id
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.room_id);
  };

  const handleResetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const token = localStorage.getItem("access");
  const handleSaveLayout = () => {
    client.post(API_BASE_URL + "layout_handler/",
      {
        layout: JSON.stringify(blocks),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Layout saved successfully:", response);
      })
      .catch((error) => console.error("Error saving layout:", error));
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 200px)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default"
      }}
    >
      <Box
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "grab",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: "center center",
            willChange: "transform"
          }}
        >
          {blocks.map((block) => (
            <RoomBlock
              key={block.room_id}
              room_id={block.room_id}
              name={block.name}
              position={block.position}
              parent={block.parent}
              onAdd={handleAddBlock}
              onRename={handleRenameBlock}
              onDelete={handleDeleteBlock}
              isPositionOccupied={isPositionOccupied}
              selectedBlock={selectedBlock}
              setSelectedBlock={setSelectedBlock}
            />
          ))}
        </Box>
      </Box>

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
        <Tooltip title="Zoom in" arrow>
          <IconButton
            onClick={() => setScale(prev => Math.min(prev * 1.2, 2))}
            color="primary"
            sx={{ bgcolor: "background.paper" }}
          >
            <ZoomInIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom out" arrow>
          <IconButton
            onClick={() => setScale(prev => Math.max(prev / 1.2, 0.5))}
            color="primary"
            sx={{ bgcolor: "background.paper" }}
          >
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset view" arrow>
          <IconButton
            onClick={handleResetView}
            color="primary"
            sx={{ bgcolor: "background.paper" }}
          >
            <CloseIcon />
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
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveLayout}
          sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
        >
          Save Layout
        </Button>

        <Button
          variant="contained"
          onClick={() => setShowHelp(true)}
        >
          Help
        </Button>

        {blocks.length === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddInitialBlock}
          >
            Add First Room
          </Button>
        )}
      </Box>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>Building Layout Editor Help</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>How to use:</strong>
          </Typography>
          <ul>
            <li><Typography variant="body2">Click and drag to pan the canvas</Typography></li>
            <li><Typography variant="body2">Use mouse wheel to zoom in/out</Typography></li>
            <li><Typography variant="body2">Click on a room to select it</Typography></li>
            <li><Typography variant="body2">Add rooms by clicking the + buttons around a selected room</Typography></li>
            <li><Typography variant="body2">Edit room names by clicking on the text field</Typography></li>
            <li><Typography variant="body2">Delete rooms using the trash icon</Typography></li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Zoom level indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 1,
          zIndex: 10
        }}
      >
        <Typography variant="caption">
          Zoom: {Math.round(scale * 100)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default EditableCanvas;