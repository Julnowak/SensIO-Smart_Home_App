import React, { useState } from "react";
import "./editableCanvas.css";

const Block = ({ id, name, position, onAdd, onRename }) => {
  return (
    <div className="block" style={{ top: position.y, left: position.x }}>
      <input
        type="text"
        value={name}
        onChange={(e) => onRename(id, e.target.value)}
        className="block-name"
      />
      <div className="add-buttons">
        <button onClick={() => onAdd(id, "top")} className="add-button">+</button>
        <button onClick={() => onAdd(id, "left")} className="add-button">+</button>
        <button onClick={() => onAdd(id, "right")} className="add-button">+</button>
        <button onClick={() => onAdd(id, "bottom")} className="add-button">+</button>
      </div>
    </div>
  );
};

const EditableCanvas = () => {
  const [blocks, setBlocks] = useState({
    1: { id: 1, name: "Room 1", position: { x: 300, y: 300 } },
  });

  const handleAddBlock = (id, direction) => {
    const newId = Object.keys(blocks).length + 1;
    const parent = blocks[id];
    let newPosition = { ...parent.position };

    switch (direction) {
      case "top":
        newPosition.y -= 100;
        break;
      case "bottom":
        newPosition.y += 100;
        break;
      case "left":
        newPosition.x -= 100;
        break;
      case "right":
        newPosition.x += 100;
        break;
      default:
        break;
    }

    setBlocks({
      ...blocks,
      [newId]: { id: newId, name: `Room ${newId}`, position: newPosition },
    });
  };

  const handleRenameBlock = (id, newName) => {
    setBlocks({
      ...blocks,
      [id]: { ...blocks[id], name: newName },
    });
  };

  const handleSaveLayout = () => {
    localStorage.setItem("layout", JSON.stringify(blocks));
    alert("Layout saved!");
  };

  return (
    <div className="canvas">
      {Object.values(blocks).map((block) => (
        <Block
          key={block.id}
          id={block.id}
          name={block.name}
          position={block.position}
          onAdd={handleAddBlock}
          onRename={handleRenameBlock}
        />
      ))}
      <button onClick={handleSaveLayout} className="save-button">Save Layout</button>
    </div>
  );
};

export default EditableCanvas;