import React from "react";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

const Droplet = ({ fillPercentage }) => {
  const validFill = Math.max(0, Math.min(100, fillPercentage)); // Ensure value is between 0-100

  return (
    <div style={{ position: "relative", width: 50, height: 50 }}>
      {/* Background Icon (Gray) */}
      <WaterDropIcon style={{ fontSize: 50, color: "#ccc", position: "absolute" }} />

      {/* Foreground Icon (Blue) with Clipping Effect */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          clipPath: `inset(${100 - validFill}% 0 0 0)`, // Clip the top portion dynamically
        }}
      >
        <WaterDropIcon style={{ fontSize: 50, color: "#2196F3" }} />
      </div>
    </div>
  );
};

export default Droplet;