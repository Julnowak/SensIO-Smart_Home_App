import React, {useState, useEffect, useRef} from "react";
import "../layoutViewer/layoutViewer.css"

const Block = ({id, name, position, light}) => {
    return (
        <div className="block-view light-on" style={{top: position.y, left: position.x}}>
            <div>
                {name}
            </div>
        </div>
    );
};

const LayoutViewer = () => {
    const [blocks, setBlocks] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePosition = useRef({x: 0, y: 0});
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({x: -200, y: -200});

    const canvasRef = useRef(null);
    console.log(blocks)

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
        lastMousePosition.current = {x: e.clientX, y: e.clientY};
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;

        setOffset((prevOffset) => ({
            x: prevOffset.x + dx,
            y: prevOffset.y + dy,
        }));

        lastMousePosition.current = {x: e.clientX, y: e.clientY};
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.addEventListener("wheel", handleWheel, {passive: false});
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, []);

    useEffect(() => {
        const savedLayout = localStorage.getItem("layout");
        if (savedLayout) {
            setBlocks(JSON.parse(savedLayout));
        }
    }, []);

    return (
        <div style={{backgroundColor: "#333333", textAlign: "right"}}>
            <button className="btn btn-warning" >
                Edytuj
            </button>
            <div className="canvas-container"
                 ref={canvasRef}
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}>

                <div
                    className="canvas"
                    style={{
                        transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                    }}
                >
                    {Object.values(blocks).map((block) => (
                        <a href={`/room/${block.id}`}>
                            <Block
                                key={block.id}
                                id={block.id}
                                name={block.name}
                                position={block.position}
                                light={true}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default LayoutViewer;
