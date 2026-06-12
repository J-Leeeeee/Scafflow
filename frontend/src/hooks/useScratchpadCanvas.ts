import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

export type ScratchpadTool = 'pen' | 'eraser';

function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

function growCanvas(canvas: HTMLCanvasElement, minWidth: number, minHeight: number) {
  if (canvas.width >= minWidth && canvas.height >= minHeight) return;

  const snapshot = document.createElement('canvas');
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext('2d')?.drawImage(canvas, 0, 0);

  canvas.width = Math.max(canvas.width, minWidth);
  canvas.height = Math.max(canvas.height, minHeight);

  const ctx = canvas.getContext('2d');
  if (!ctx || snapshot.width === 0 || snapshot.height === 0) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(snapshot, 0, 0);
}

export function useScratchpadCanvas(activeTool: ScratchpadTool) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backingRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  function syncVisible() {
    const canvas = canvasRef.current;
    const backing = backingRef.current;
    if (!canvas || !backing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = getDevicePixelRatio();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(backing, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getBackingContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let backing = backingRef.current;
    if (!backing) {
      backing = document.createElement('canvas');
      backing.width = canvas.width;
      backing.height = canvas.height;
      backingRef.current = backing;
    } else {
      growCanvas(backing, canvas.width, canvas.height);
    }

    const ctx = backing.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(getDevicePixelRatio(), 0, 0, getDevicePixelRatio(), 0, 0);
    return ctx;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const drawingCanvas = canvas;
    const drawingContainer = container;

    function resizeCanvas() {
      const rect = drawingContainer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = getDevicePixelRatio();
      const newWidth = Math.max(1, Math.floor(rect.width * dpr));
      const newHeight = Math.max(1, Math.floor(rect.height * dpr));

      let backing = backingRef.current;
      if (!backing) {
        backing = document.createElement('canvas');
        backingRef.current = backing;
      }

      if (drawingCanvas.width > 0 && drawingCanvas.height > 0) {
        growCanvas(backing, drawingCanvas.width, drawingCanvas.height);
        const backingCtx = backing.getContext('2d');
        if (backingCtx) {
          backingCtx.setTransform(1, 0, 0, 1, 0, 0);
          backingCtx.imageSmoothingEnabled = false;
          backingCtx.drawImage(drawingCanvas, 0, 0);
        }
      }

      growCanvas(backing, newWidth, newHeight);

      drawingCanvas.width = newWidth;
      drawingCanvas.height = newHeight;
      drawingCanvas.style.width = `${rect.width}px`;
      drawingCanvas.style.height = `${rect.height}px`;

      syncVisible();
    }

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(drawingContainer);
    return () => observer.disconnect();
  }, []);

  function getPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function drawPoint(point: { x: number; y: number }) {
    const context = getBackingContext();
    if (!context) return;

    context.save();
    context.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    context.fillStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : '#111827';
    context.beginPath();
    context.arc(point.x, point.y, activeTool === 'eraser' ? 11 : 1.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
    syncVisible();
  }

  function drawLine(from: { x: number; y: number }, to: { x: number; y: number }) {
    const context = getBackingContext();
    if (!context) return;

    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : '#111827';
    context.lineWidth = activeTool === 'eraser' ? 22 : 3;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
    syncVisible();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getPoint(event);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = point;
    drawPoint(point);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;

    const point = getPoint(event);
    const previousPoint = lastPointRef.current;
    if (!point || !previousPoint) return;

    drawLine(previousPoint, point);
    lastPointRef.current = point;
  }

  function stopDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const backing = backingRef.current ?? document.createElement('canvas');
    backingRef.current = backing;
    backing.width = canvas.width;
    backing.height = canvas.height;
    backing.getContext('2d')?.clearRect(0, 0, backing.width, backing.height);
    syncVisible();
  }

  return {
    canvasRef,
    handlePointerDown,
    handlePointerMove,
    stopDrawing,
    clearCanvas,
  };
}
