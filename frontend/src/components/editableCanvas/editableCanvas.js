import React, { useState, useRef, useEffect } from "react";
import "./editableCanvas.css";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import { v4 as uuidv4 } from "uuid";


const Block = ({ room_id, name, position, parent,  onAdd, onRename, isPositionOccupied }) => {

    return (
        <div className="block" style={{ top: position.y, left: position.x }}>
            <input
                type="text"
                value={name}
                onChange={(e) => onRename(room_id, e.target.value)}
                className="block-name"
            />
            <div className="add-buttons">
                <div></div>
                <button onClick={() => onAdd(room_id, "top")} className="add-button" disabled={isPositionOccupied({ x: position.x, y: position.y - 140 })}>+</button>
                <div></div>
                <button onClick={() => onAdd(room_id, "left")} className="add-button" disabled={isPositionOccupied({ x: position.x - 120, y: position.y })}>+</button>
                <div></div>
                <button onClick={() => onAdd(room_id, "right")} className="add-button" disabled={isPositionOccupied({ x: position.x + 120, y: position.y })}>+</button>
                <div></div>
                <button onClick={() => onAdd(room_id, "bottom")} className="add-button" disabled={isPositionOccupied({ x: position.x, y: position.y + 140 })}>+</button>
            </div>
        </div>
    );
};

const EditableCanvas = ({layout, floor_id}) => {
    const [blocks, setBlocks] = useState({});

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: -200, y: -200 });
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
        console.log(layout)
        if (layout && layout?.length>0) {
            setBlocks(layout);
        }
        else{
            setBlocks({1: {room_id: 1, name: "Room 1", position: {x: 0, y: 0}, floor: floor_id}})
        }

        const canvas = canvasRef.current;
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [floor_id, layout]);

    const isPositionOccupied = (newPosition) => {
        return Object.values(blocks).some(block =>
            block.position.x === newPosition.x && block.position.y === newPosition.y
        );
    };

const handleAddBlock = (room_id, direction) => {
    const tempId = `temp-${uuidv4()}`;
    const newId = Object.keys(blocks).length + 1;
    const parent = blocks.find(b => b.room_id === room_id);

    if (!parent) return; // Safety check

    // Create a new position object (avoid direct mutation)
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
            return;
    }

    const newBlock = {
        room_id: tempId,  // Tymczasowe ID
        name: `Pokój ${newId}`,  // Nazwa można zmienić później
        position: newPosition,
        parent: room_id, // Może być również tymczasowe ID
        floor: floor_id // Może być również tymczasowe ID
    };

    if (!isPositionOccupied(newPosition)) {
        setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    } else {
        alert("Cannot place block here, position occupied!");
    }
};


    const handleRenameBlock = (room_id, newName) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(b =>
                b.room_id === room_id ? { ...b, name: newName } : b
            )
        );
    };


    const token = localStorage.getItem("access");
    const handleSaveLayout = () => {
        console.log(blocks)
        client.post(API_BASE_URL + "layout_handler/",
            {
                layout: JSON.stringify(blocks),
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
                        key={block.room_id}
                        room_id={block.room_id}
                        name={block.name}
                        position={block.position}
                        parent={block.parent}
                        onAdd={handleAddBlock}
                        onRename={handleRenameBlock}
                        isPositionOccupied={isPositionOccupied}
                    />
                ))}
            </div>
            <button onClick={handleSaveLayout} className="save-button">Zapisz</button>
        </div>
    );
};

const saveToBackend = async (block) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Math.floor(Math.random() * 1000) + 1); // Zwraca losowe ID
        }, 1000);
    });
};

export default EditableCanvas;
