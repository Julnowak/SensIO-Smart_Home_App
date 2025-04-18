import React, { useState, useEffect } from "react";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { keyframes, styled } from "@mui/system";

const fillAnimation = keyframes`
  0% { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(var(--fill-percentage) 0 0 0); }
`;

const rippleAnimation = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 0; }
`;

const DropletContainer = styled("div")({
  position: "relative",
  width: 60,
  height: 60,
});

const DropletBackground = styled(WaterDropIcon)({
  fontSize: 60,
  color: "#e0e0e0",
  position: "absolute",
});

const DropletFill = styled("div")(({ fillpercentage }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  "--fill-percentage": `${100 - fillpercentage}%`,
  animation: `${fillAnimation} 1s ease-out forwards`,
}));

const ColoredDroplet = styled(WaterDropIcon)(({ fillpercentage }) => ({
  fontSize: 60,
  color: `hsl(${210 - fillpercentage * 0.5}, 80%, 50%)`, // Color changes with fill level
  filter: `drop-shadow(0 0 ${fillpercentage * 0.1}px rgba(33, 150, 243, 0.5))`,
}));

const RippleEffect = styled("div")({
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  backgroundColor: "rgba(33, 150, 243, 0.3)",
  animation: `${rippleAnimation} 1.5s infinite`,
});

const Droplet = ({ fillPercentage }) => {
  const [prevFill, setPrevFill] = useState(0);
  const [rippleKey, setRippleKey] = useState(0);
  const validFill = Math.max(0, Math.min(100, fillPercentage));

  useEffect(() => {
    if (prevFill !== validFill) {
      setRippleKey((k) => k + 1); // Trigger ripple effect on change
      setPrevFill(validFill);
    }
  }, [validFill, prevFill]);

  return (
    <DropletContainer>
      {/* Background Drop */}
      <DropletBackground />

      {/* Filled Portion */}
      <DropletFill fillpercentage={validFill}>
        <ColoredDroplet fillpercentage={validFill} />
      </DropletFill>

      {/* Animated Ripple Effect */}
      {validFill > 0 && validFill < 100 && (
        <RippleEffect key={rippleKey} style={{ animationDelay: "0.3s" }} />
      )}

      {/* Percentage Text */}
      <div style={{
        position: "absolute",
        width: "100%",
        textAlign: "center",
        top: "50%",
        transform: "translateY(-50%)",
        color: validFill > 50 ? "white" : "#666",
        fontSize: "0.8rem",
        fontWeight: "bold",
        pointerEvents: "none",
      }}>
        {validFill}%
      </div>
    </DropletContainer>
  );
};

export default Droplet;