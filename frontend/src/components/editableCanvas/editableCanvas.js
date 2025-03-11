import React, { useState, useRef, useEffect } from "react";
import "./editableCanvas.css";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const Block = ({ id, name, position, onAdd, onRename, isPositionOccupied }) => {
    return (
        <div className="block" style={{ top: position.y, left: position.x }}>
            <input
                type="text"
                value={name}
                onChange={(e) => onRename(id, e.target.value)}
                className="block-name"
            />
            <div className="add-buttons">
                <div></div>
                <button onClick={() => onAdd(id, "top")} className="add-button" disabled={isPositionOccupied({ x: position.x, y: position.y - 140 })}>+</button>
                <div></div>
                <button onClick={() => onAdd(id, "left")} className="add-button" disabled={isPositionOccupied({ x: position.x - 120, y: position.y })}>+</button>
                <div></div>
                <button onClick={() => onAdd(id, "right")} className="add-button" disabled={isPositionOccupied({ x: position.x + 120, y: position.y })}>+</button>
                <div></div>
                <button onClick={() => onAdd(id, "bottom")} className="add-button" disabled={isPositionOccupied({ x: position.x, y: position.y + 140 })}>+</button>
            </div>
        </div>
    );
};

const EditableCanvas = ({floor_id}) => {
    const [blocks, setBlocks] = useState({});
    const savedLayout = localStorage.getItem("layout");

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
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
        setIsDragging(true);
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
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
        if (savedLayout) {
            setBlocks(JSON.parse(savedLayout));
        }
        else{
            setBlocks({1: {id: 1, name: "Room 1", position: {x: 0, y: 0}}})
        }

        const canvas = canvasRef.current;
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [savedLayout]);

    const isPositionOccupied = (newPosition) => {
        return Object.values(blocks).some(block =>
            block.position.x === newPosition.x && block.position.y === newPosition.y
        );
    };

    const handleAddBlock = (id, direction) => {
        const newId = Object.keys(blocks).length + 1;
        const parent = blocks[id];
        let newPosition = { ...parent.position };

        switch (direction) {
            case "top":
                newPosition.y -= 140;
                break;
            case "bottom":
                newPosition.y += 140;
                break;
            case "left":
                newPosition.x -= 120;
                break;
            case "right":
                newPosition.x += 120;
                break;
            default:
                break;
        }

        if (!isPositionOccupied(newPosition)) {
            setBlocks({
                ...blocks,
                [newId]: { id: newId, name: `Room ${newId}`, position: newPosition },
            });
        } else {
            alert("Cannot place block here, position occupied!");
        }
    };

    const handleRenameBlock = (id, newName) => {
        setBlocks({
            ...blocks,
            [id]: { ...blocks[id], name: newName },
        });
    };

    const token = localStorage.getItem("access");
    const handleSaveLayout = () => {
        localStorage.setItem("layout", JSON.stringify(blocks));

        client.post(API_BASE_URL + "layout_handler/",
            {
                layout: JSON.stringify(blocks),
                floor_id: floor_id
            }, {
                headers: {
                        Authorization: `Bearer ${token}`,
                    },
            }) // Pobiera dane lokacji
            .then((response) => {
                console.log(response)
            })
            .catch((error) => console.error("Error fetching location:", error));
    };

    return (
        <div
            ref={canvasRef}
            className="canvas-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div
                className="canvas"
                style={{
                    transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                }}
            >
                {Object.values(blocks).map((block) => (
                    <Block
                        key={block.id}
                        id={block.id}
                        name={block.name}
                        position={block.position}
                        onAdd={handleAddBlock}
                        onRename={handleRenameBlock}
                        isPositionOccupied={isPositionOccupied}
                    />
                ))}
            </div>
            <button onClick={handleSaveLayout} className="save-button">Save Layout</button>
        </div>
    );
};

export default EditableCanvas;
