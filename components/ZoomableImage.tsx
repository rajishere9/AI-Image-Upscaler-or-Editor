import React, { useState, useRef, useCallback } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

const ResetZoomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6" />
  </svg>
);


export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const initialPinchState = useRef<{ scale: number; distance: number; position: { x: number; y: number }, pinchCenter: { x: number; y: number } } | null>(null);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const updatePosition = useCallback((newPosition: { x: number; y: number }, currentScale: number) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const baseImageWidth = imageRect.width / scale;
    const baseImageHeight = imageRect.height / scale;

    const maxOffsetX = Math.max(0, (baseImageWidth * currentScale - containerRect.width) / 2);
    const maxOffsetY = Math.max(0, (baseImageHeight * currentScale - containerRect.height) / 2);
    
    setPosition({
      x: clamp(newPosition.x, -maxOffsetX, maxOffsetX),
      y: clamp(newPosition.y, -maxOffsetY, maxOffsetY),
    });
  }, [scale]);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale > 1.01) {
      handleReset();
    } else {
      const newScale = 3;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = (rect.width / 2 - mouseX) * (newScale - 1);
      const newY = (rect.height / 2 - mouseY) * (newScale - 1);
      
      setScale(newScale);
      updatePosition({ x: newX, y: newY }, newScale);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.focus();
    setIsPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    
    const newPosition = {
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
    };
    updatePosition(newPosition, scale);
  }, [isPanning, startPan, scale, updatePosition]);
  
  const handleMouseUpOrLeave = () => {
    if(isPanning) {
        setIsPanning(false);
    }
  };

  const getDistance = (touches: TouchList | React.TouchList) => {
    return Math.sqrt(
      Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && scale > 1) {
      e.currentTarget.focus();
      setIsPanning(true);
      setStartPan({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      if (!containerRef.current) return;
      
      const distance = getDistance(e.touches);
      const rect = containerRef.current.getBoundingClientRect();
      const pinchCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
      };

      initialPinchState.current = { scale, distance, position, pinchCenter };
    }
  };
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isPanning && e.touches.length === 1) {
      const newPosition = {
          x: e.touches[0].clientX - startPan.x,
          y: e.touches[0].clientY - startPan.y,
      };
      updatePosition(newPosition, scale);
    } else if (e.touches.length === 2 && initialPinchState.current && containerRef.current) {
        const { distance: initialDistance, scale: initialScale, position: initialPosition, pinchCenter } = initialPinchState.current;

        const newDist = getDistance(e.touches);
        const scaleRatio = newDist / initialDistance;
        const newScale = clamp(initialScale * scaleRatio, 1, 8);
        
        if (newScale === initialScale) return;
        
        const rect = containerRef.current.getBoundingClientRect();

        const newX = (pinchCenter.x - rect.width / 2) * (1 - newScale / initialScale) + initialPosition.x * (newScale / initialScale);
        const newY = (pinchCenter.y - rect.height / 2) * (1 - newScale / initialScale) + initialPosition.y * (newScale / initialScale);

        if (newScale < 1.01) {
            handleReset();
        } else {
            setScale(newScale);
            updatePosition({ x: newX, y: newY }, newScale);
        }
    }
  }, [isPanning, startPan, scale, updatePosition, handleReset]);

  const handleTouchEnd = () => {
    setIsPanning(false);
    initialPinchState.current = null;
  };
  
  const cursorClass = scale > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : '';

  return (
    <div 
        ref={containerRef}
        className={`w-full h-full ${cursorClass} relative group overflow-hidden bg-slate-900 flex items-center justify-center select-none touch-none`}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        tabIndex={-1}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          cursor: 'inherit',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
        draggable={false}
      />
      {scale > 1.01 && (
        <button
          onClick={handleReset}
          className="absolute top-2 right-2 bg-slate-800/70 text-slate-100 rounded-full p-2 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label="Reset zoom"
        >
          <ResetZoomIcon className="w-5 h-5" />
        </button>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/70 text-slate-200 text-xs rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {scale > 1 ? 'Double-click to reset, drag to pan' : 'Double-click / Pinch to zoom'}
      </div>
    </div>
  );
};
