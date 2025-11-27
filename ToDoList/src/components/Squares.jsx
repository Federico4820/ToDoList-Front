import React, { useEffect, useRef } from "react";

const Squares = ({
  direction = "diagonal",
  speed = 0.5,
  borderColor = "#333",
  squareSize = 40,
  hoverFillColor = "#0b1f3a",
  className = "",
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null);
  const lastMouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // resize canvas to device pixels for sharpness
    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      // Use the larger of window inner dimensions or screen dimensions to ensure coverage
      // This helps on mobile where innerHeight changes with browser bars
      const w = Math.max(window.innerWidth, window.screen.width, document.documentElement.scrollWidth);
      const h = Math.max(window.innerHeight, window.screen.height, document.documentElement.scrollHeight);
      
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); // keep drawing in CSS pixels
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawGrid = () => {
      // sfondo scuro
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // compute start based on offsets
      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      // draw squares
      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = Math.round(x - (gridOffset.current.x % squareSize));
          const squareY = Math.round(y - (gridOffset.current.y % squareSize));

          // base fill: grigio scuro
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(squareX, squareY, squareSize, squareSize);

          // hover: check relative to lastMouse
          if (hoveredSquare.current) {
            // hoveredSquare.current holds grid indices; compute those for this x,y
            const hx = Math.floor((x - startX) / squareSize);
            const hy = Math.floor((y - startY) / squareSize);
            if (
              hoveredSquare.current.x === hx &&
              hoveredSquare.current.y === hy
            ) {
              ctx.fillStyle = hoverFillColor;
              ctx.fillRect(squareX, squareY, squareSize, squareSize);
            }
          }

          // borders (use 0.5 offset to get 1px sharp lines)
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(squareX + 0.5, squareY + 0.5, squareSize, squareSize);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    // --- mouse handlers attached to window so canvas reacts even if it's behind other elements ---
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // save last mouse for possible use elsewhere
      lastMouse.current = { x: mouseX, y: mouseY };

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX) / squareSize
      );
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / squareSize
      );

      hoveredSquare.current = { x: hoveredSquareX, y: hoveredSquareY };
    };

    const handleMouseLeave = () => {
      hoveredSquare.current = null;
      lastMouse.current = { x: -9999, y: -9999 };
    };

    // attach to window, not canvas
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // start animation
    requestRef.current = requestAnimationFrame(updateAnimation);

    // cleanup
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`squares-canvas ${className}`}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};

export default Squares;
