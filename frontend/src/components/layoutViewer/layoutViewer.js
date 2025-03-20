import React, {useState, useEffect, useRef} from "react";
import "../layoutViewer/layoutViewer.css"

const Block = ({room_id, name, position, light}) => {
    return (
        <div className={`block-view ${light ? 'light-on' : 'light-off'}`} style={{top: position.y, left: position.x}}>
            <div>
                {name}
            </div>
        </div>
    );
};

const LayoutViewer = ({layout}) => {
    const [blocks, setBlocks] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePosition = useRef({x: 0, y: 0});
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({x: -200, y: -200});

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
        if (canvas) {
            canvas.addEventListener("wheel", handleWheel, {passive: false});
            return () => canvas.removeEventListener("wheel", handleWheel);
        }
    }, []);

    useEffect(() => {

        if (layout.length > 0) {
            setBlocks(layout);
        }
    }, [layout]);

    return (
        <div>

            {layout?.length > 0 ?
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
                            <a key={block.room_id} href={`/room/${block.room_id}`}>
                                <Block

                                    id={block.room_id}
                                    name={block.name}
                                    position={block.position}
                                    light={block.light}
                                />
                            </a>
                        ))}
                    </div>
                </div>

                : <div>
                    To piętro nie ma jeszcze zdefiniowanych pokoi. Kliknij "Edytuj", aby je dodać.
                </div>
            }

        </div>

    );
};

export default LayoutViewer;
