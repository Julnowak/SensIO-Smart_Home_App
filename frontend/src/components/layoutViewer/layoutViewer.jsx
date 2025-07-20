import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  HelpOutline as HelpIcon,
  Home as HomeIcon,
  Lightbulb as LightbulbIcon,
  Close as CloseIcon, Edit
} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

const CanvasContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 'calc(100vh - 300px)', // More responsive height
  minHeight: '300px', // Minimum height for very small screens
  maxHeight: '70vh', // Maximum height for larger screens
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  marginTop: theme.spacing(2),
  touchAction: 'none' // Important for touch events
}));

const Canvas = styled(Box)({
  position: 'absolute',
  transformOrigin: 'center center',
  willChange: 'transform',
});

const BlockView = styled(Box)(({ theme, light, pos }) => ({
  position: 'absolute',
  width: pos.width,
  height: pos.height,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  backgroundColor: light ? theme.palette.warning.light : theme.palette.grey[300],
  border: `2px solid ${light ? theme.palette.warning.main : theme.palette.divider}`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
    zIndex: 2
  },
  '& .MuiTypography-root': {
    color: light ? theme.palette.getContrastText(theme.palette.warning.light) : 'inherit',
    fontWeight: 500,
    fontSize: '0.75rem', // Smaller font for mobile
    wordBreak: 'break-word', // Handle long room names
    textAlign: 'center',
    padding: '0 4px' // Add some padding
  },
}));

const LayoutViewer = ({ layout, floorId }) => {
  const [blocks, setBlocks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef(null);
  const canvasRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate()
  const calculateCenter = useCallback(() => {
    if (blocks.length === 0) return;

    const positions = blocks.map(block => block.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x +p.width));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y+p.height));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const container = canvasRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const newOffsetX = (containerWidth / 2 - centerX * scale) / scale;
      const newOffsetY = (containerHeight / 2 - centerY * scale) / scale;

      setOffset({ x: newOffsetX, y: newOffsetY });
    }
  }, [blocks, scale]);

  // Center layout when blocks or container size changes
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;


    calculateCenter();

    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(calculateCenter);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [calculateCenter]);

  // const handleWheel = (e) => {
  //   e.preventDefault();
  //   const zoomFactor = 1.1;
  //   setScale(prev => {
  //     const newScale = e.deltaY > 0 ? prev / zoomFactor : prev * zoomFactor;
  //     return Math.max(0.5, Math.min(newScale, 2));
  //   });
  // };

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePosition.current.x;
    const dy = e.clientY - lastMousePosition.current.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Calculate distance between two touches
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - lastMousePosition.current.x;
      const dy = e.touches[0].clientY - lastMousePosition.current.y;

      setOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      lastMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Handle pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current) {
        const zoomFactor = currentDistance / lastTouchDistance.current;
        setScale(prev => {
          const newScale = prev * zoomFactor;
          return Math.max(0.5, Math.min(newScale, 2));
        });
      }

      lastTouchDistance.current = currentDistance;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  };

  const handleResetView = () => {
    setScale(isMobile ? 0.8 : 1);
    calculateCenter();
  };

  useEffect(() => {
    if (layout?.length > 0) {
      setBlocks(layout);
      calculateCenter();
    }
    else{
      setBlocks(layout);
    }
  }, [layout, calculateCenter]);

  return (
    <Box sx={{ position: 'relative', p: isMobile ? 1 : 2 }}>
      {blocks.length > 0 ? (
        <CanvasContainer
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          // onWheel={handleWheel}
          sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <Canvas style={{
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
          }}>
            {blocks.map((block) => (
              <Button
                key={block.room_id}
                component="a"
                href={`/room/${block.room_id}`}
                sx={{
                  position: 'absolute',
                  top: block.position.y +block.position.height/2,
                  left: block.position.x +block.position.width/2,
                  textTransform: 'none',
                  p: 0,
                  '&:hover': { textDecoration: 'none' }
                }}
              >
                <BlockView light={block.light} pos={block.position}>
                  <Typography variant="body2">
                    {block.name}
                  </Typography>
                  {block.light && (
                    <LightbulbIcon sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      fontSize: '1rem',
                      color: 'warning.main'
                    }} />
                  )}
                </BlockView>
              </Button>
            ))}
          </Canvas>

          {/* Controls - Different layout for mobile */}
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <IconButton
              onClick={() => setScale(p => Math.min(p * 1.2, 2))}
              color="primary"
              sx={{ bgcolor: 'background.paper' }}
              size={isMobile ? 'small' : 'medium'}
            >
              <ZoomInIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton
              onClick={() => setScale(p => Math.max(p / 1.2, 0.5))}
              color="primary"
              sx={{ bgcolor: 'background.paper' }}
              size={isMobile ? 'small' : 'medium'}
            >
              <ZoomOutIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton
              onClick={handleResetView}
              color="primary"
              sx={{ bgcolor: 'background.paper' }}
              size={isMobile ? 'small' : 'medium'}
            >
              <HomeIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton
              onClick={() => setShowHelp(true)}
              color="primary"
              sx={{ bgcolor: 'background.paper' }}
              size={isMobile ? 'small' : 'medium'}
            >
              <HelpIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>

          <Box sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 1
          }}>
            <Typography variant="caption">
              Skala: {Math.round(scale * 100)}%
            </Typography>
          </Box>
        </CanvasContainer>
      ) : (
        <Box sx={{
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 2
        }}>
          <HomeIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            To piętro nie ma jeszcze zdefiniowanych pokoi
          </Typography>
          <Button variant="contained" startIcon={<Edit />} onClick={() => {
            navigate("/editor", { state: { floorId: floorId, layout: null } })
          }}>
            Edytuj rozmieszczenie
          </Button>
        </Box>
      )}

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} fullScreen={isMobile}>
        <DialogTitle>Instrukcja obsługi</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <strong>Nawigacja:</strong>
          </Typography>
          <ul>
            <li><Typography>Przytrzymaj palec do przesuwania widoku</Typography></li>
            <li><Typography>Rozsuń/pomiędzy palcami do przybliżania/oddalania</Typography></li>
            <li><Typography>Kliknij pokój aby przejść do szczegółów</Typography></li>
          </ul>
          <Typography gutterBottom mt={2}>
            <strong>Legenda:</strong>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LightbulbIcon color="warning" />
            <Typography>Żarówka oznacza włączone oświetlenie</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LayoutViewer;