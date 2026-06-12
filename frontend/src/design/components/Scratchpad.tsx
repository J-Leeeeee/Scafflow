import { useState, type ReactNode } from 'react';

import { useScratchpadCanvas, type ScratchpadTool } from '../../hooks/useScratchpadCanvas';

export function Scratchpad() {
  const [activeTool, setActiveTool] = useState<ScratchpadTool>('pen');
  const { canvasRef, handlePointerDown, handlePointerMove, stopDrawing, clearCanvas } =
    useScratchpadCanvas(activeTool);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex h-[44px] shrink-0 items-center justify-between border-b border-[#E1E1E1] bg-white px-4">
        <div className="flex items-center gap-2">
          <PencilIcon color="#615FFF" />
          <span className="text-[14px] font-medium text-black">Scratchpad</span>
        </div>
        <button
          type="button"
          aria-label="Scratchpad settings"
          className="text-[#9CA3AF] hover:text-[#4B5563]"
        >
          <SettingsIcon />
        </button>
      </div>

      <div className="flex h-[44px] shrink-0 items-center gap-1 border-b border-[#E1E1E1] bg-white px-3">
        <ToolGroup>
          <ToolButton label="Pencil" active={activeTool === 'pen'} onClick={() => setActiveTool('pen')}>
            <PencilIcon color="#615FFF" />
          </ToolButton>
          <ToolButton label="Eraser" active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')}>
            <EraserIcon />
          </ToolButton>
          <ToolButton label="Clear scratchpad" onClick={clearCanvas}>
            <ClearIcon />
          </ToolButton>
        </ToolGroup>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          aria-label="Scratchpad drawing canvas"
          className="absolute inset-0 touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

function ToolGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolButton({
  children,
  label,
  active = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        active ? 'bg-[#EEF0FF] text-[#615FFF]' : 'text-[#4B5563] hover:bg-[#F3F4F6]'
      }`}
    >
      {children}
    </button>
  );
}

function EraserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M2.5 9.5l6-6a1.4 1.4 0 0 1 2 0l2 2a1.4 1.4 0 0 1 0 2l-5.5 5.5H4.5l-2-2a1.4 1.4 0 0 1 0-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 3l3 3" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="3" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="13" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}
