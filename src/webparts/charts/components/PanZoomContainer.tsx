import * as React from "react";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const PanZoomContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scale, setScale] = React.useState(1);
    const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
    const [dragging, setDragging] = React.useState(false);
    const [lastPos, setLastPos] = React.useState<{ x: number; y: number } | null>(null);
  
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      // Use the wheel delta to adjust the scale (zoom level)
      const delta = -e.deltaY;
      let newScale = scale + delta * 0.001;
      if (newScale < 0.2) newScale = 0.2;
      if (newScale > 3) newScale = 3;
      setScale(newScale);
    };
  
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    };
  
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragging || !lastPos) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
    };
  
    const handleMouseUp = () => {
      setDragging(false);
      setLastPos(null);
    };
  
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: dragging ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      </div>
    );
  };