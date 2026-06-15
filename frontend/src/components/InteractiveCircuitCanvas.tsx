import { useState } from 'react';
import { CurrentSource, MeshCurrentArrow, Resistor, VoltageSource } from '../design/components/circuit-symbols';
import {
  parseCircuitCanvasState,
  type CircuitCanvasState,
  type CircuitCanvasTask,
  type CircuitNodeId,
} from '../lib/circuitCanvas';

export type { CircuitCanvasState };

const NODE_DOTS: ReadonlyArray<readonly [number, number]> = [
  [280, 0],
  [280, 80],
  [240, 80],
  [240, 0],
  [160, 0],
  [160, 80],
  [60, 0],
];

const MESH_LOOPS: ReadonlyArray<readonly [number, number]> = [
  [150, -25],
  [110, 40],
  [212, 40],
];

const GROUND_NODE_TARGETS: ReadonlyArray<{
  id: CircuitNodeId;
  cx: number;
  cy: number;
  label: string;
}> = [
  { id: 'left_node', cx: 60, cy: 0, label: 'left node' },
  { id: 'center_node', cx: 160, cy: 0, label: 'center node' },
  { id: 'terminal_a', cx: 240, cy: 0, label: 'terminal a node' },
  { id: 'bottom_rail', cx: 160, cy: 80, label: 'bottom rail' },
  { id: 'terminal_b', cx: 240, cy: 80, label: 'terminal b node' },
];

export function InteractiveCircuitCanvas({
  onChange,
  initialState,
  task = 'short_mesh',
}: {
  onChange: (state: string) => void;
  initialState?: string;
  task?: CircuitCanvasTask;
}) {
  const parsedInitial = parseCircuitCanvasState(initialState ?? null);
  const taskInitial = parsedInitial?.task === task ? parsedInitial : null;
  const [isShorted, setIsShorted] = useState(taskInitial?.isShorted ?? false);
  const [loops, setLoops] = useState<Record<number, string>>(taskInitial?.loops ?? {});
  const [selectedNode, setSelectedNode] = useState<CircuitNodeId | undefined>(taskInitial?.selectedNode);
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);

  const handleTerminalClick = (term: string) => {
    if (task !== 'short_mesh') return;

    if (activeTerminal && activeTerminal !== term) {
      setIsShorted(true);
      setActiveTerminal(null);
      onChange(JSON.stringify({ isShorted: true, loops }));
    } else {
      setActiveTerminal(term);
    }
  };

  const handleLoopClick = (idx: number) => {
    if (task !== 'short_mesh') return;

    const nextLoops = { ...loops };
    if (!nextLoops[idx]) {
      nextLoops[idx] = `i${idx + 1}`;
    } else {
      delete nextLoops[idx];
    }
    setLoops(nextLoops);
    onChange(JSON.stringify({ isShorted, loops: nextLoops }));
  };

  const handleGroundNodeClick = (nodeId: CircuitNodeId) => {
    if (task !== 'ground_node') return;

    setSelectedNode(nodeId);
    setActiveTerminal(null);
    onChange(JSON.stringify({
      task: 'ground_node',
      selectedNode: nodeId,
      isShorted: false,
      loops: {},
    }));
  };

  const selectedTarget = GROUND_NODE_TARGETS.find((target) => target.id === selectedNode);

  return (
    <main className="min-w-0 flex-1 bg-[#F8F9FA] p-4">
      <div className="flex h-full min-h-[720px] flex-col rounded-t-xl border border-[#E1E1E1] bg-white shadow-sm overflow-hidden">
        <header className="flex h-[48px] items-center justify-between border-b border-[#E1E1E1] px-4">
          <div className="flex items-center gap-2">
            <span className="size-4 rounded bg-[#EFF6FF]" />
            <h2 className="text-[15px] font-bold">Interactive Circuit Canvas</h2>
          </div>
        </header>
        <div className="p-4 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
          {task === 'ground_node' ? (
            <>
              <strong>Instructions:</strong> Click the bottom rail node to choose it as the reference ground for nodal analysis.
            </>
          ) : (
            <>
              <strong>Instructions:</strong> Click terminal <strong>a</strong> and then <strong>b</strong> to short them together. Click inside the three circuit loops to add mesh current labels.
            </>
          )}
        </div>
        <div className="flex-1 p-8 flex items-center justify-center">
          <svg viewBox="4.67 -84.71 309.33 190.71" className="w-full max-w-[500px]">
            <rect x="4.67" y="-84.71" width="309.33" height="190.71" fill="white" />

            <g stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polyline points="60,20 60,0" />
              <polyline points="60,60 60,80 160,80" />
              <polyline points="60,0 90,0" />
              <polyline points="130,0 160,0 160,20" />
              <polyline points="160,60 160,80" />
              <polyline points="60,0 60,-50 140,-50" />
              <polyline points="160,0 180,0" />
              <polyline points="220,0 240,0 240,-50 180,-50" />
              <polyline points="160,80 180,80" />
              <polyline points="220,80 240,80 240,60" />
              <polyline points="240,20 240,0" />
              <polyline points="240,0 280,0" />
              <polyline points="240,80 280,80" />
            </g>

            <VoltageSource transform="translate(60 40) rotate(90)" />
            <Resistor transform="translate(110 0)" />
            <Resistor transform="translate(160 -50)" />
            <Resistor transform="translate(160 40) rotate(90)" />
            <Resistor transform="translate(240 40) rotate(90)" />
            <Resistor transform="translate(200 80) rotate(180)" />
            <CurrentSource transform="translate(200 0) rotate(180)" />

            <g fill="#000">
              {NODE_DOTS.map(([x, y]) => (
                <circle key={`${x}:${y}`} cx={x} cy={y} r="2" />
              ))}
            </g>

            <g
              fontFamily="'Times New Roman', Georgia, serif"
              fontSize="12"
              fill="#000"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              <text x="30" y="40">9V</text>
              <text x="110" y="-10">5Ω</text>
              <text x="160" y="-60">20Ω</text>
              <text x="200" y="-20">1.8 A</text>
              <text x="180" y="40">25Ω</text>
              <text x="200" y="70">10Ω</text>
              <text x="260" y="40">60Ω</text>
              <text x="290" y="0">a</text>
              <text x="290" y="80">b</text>
            </g>

            {task === 'short_mesh' && MESH_LOOPS.map(([cx, cy], idx) => (
              <g key={idx} className="cursor-pointer" onClick={() => handleLoopClick(idx)}>
                <circle cx={cx} cy={cy} r="20" fill="transparent" />
                {loops[idx] && <MeshCurrentArrow cx={cx} cy={cy} label={loops[idx]} />}
              </g>
            ))}

            {task === 'short_mesh' && isShorted && (
              <polyline points="280,0 300,0 300,80 280,80" stroke="#615FFF" strokeWidth="2.5" fill="none" />
            )}

            {task === 'ground_node' && (
              <>
                <polyline
                  points="60,80 160,80"
                  stroke="transparent"
                  strokeWidth="18"
                  strokeLinecap="round"
                  className="cursor-pointer"
                  onClick={() => handleGroundNodeClick('bottom_rail')}
                />
                {GROUND_NODE_TARGETS.map((target) => (
                  <circle
                    key={target.id}
                    cx={target.cx}
                    cy={target.cy}
                    r={target.id === 'bottom_rail' ? 14 : 11}
                    fill={selectedNode === target.id ? 'rgba(97,95,255,0.18)' : 'transparent'}
                    stroke={selectedNode === target.id ? '#615FFF' : 'transparent'}
                    strokeWidth="1.5"
                    className="cursor-pointer hover:fill-blue-100/50 transition-colors"
                    aria-label={`Select ${target.label} as ground`}
                    onClick={() => handleGroundNodeClick(target.id)}
                  />
                ))}
                {selectedTarget && <GroundMarker cx={selectedTarget.cx} cy={selectedTarget.cy} />}
              </>
            )}

            {task === 'short_mesh' && (
              <>
                <circle
                  cx="280" cy="0" r="10"
                  fill={activeTerminal === 'a' ? 'rgba(97,95,255,0.4)' : 'transparent'}
                  stroke={activeTerminal === 'a' ? '#615FFF' : 'transparent'}
                  className="cursor-pointer hover:fill-blue-100/50 transition-colors"
                  onClick={() => handleTerminalClick('a')}
                />
                <circle
                  cx="280" cy="80" r="10"
                  fill={activeTerminal === 'b' ? 'rgba(97,95,255,0.4)' : 'transparent'}
                  stroke={activeTerminal === 'b' ? '#615FFF' : 'transparent'}
                  className="cursor-pointer hover:fill-blue-100/50 transition-colors"
                  onClick={() => handleTerminalClick('b')}
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </main>
  );
}

function GroundMarker({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g
      transform={`translate(${cx} ${cy})`}
      stroke="#615FFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
      pointerEvents="none"
    >
      <circle cx="0" cy="0" r="6.5" fill="rgba(97,95,255,0.18)" />
      <line x1="0" y1="5" x2="0" y2="15" />
      <line x1="-8" y1="15" x2="8" y2="15" />
      <line x1="-5" y1="19" x2="5" y2="19" />
      <line x1="-2.5" y1="23" x2="2.5" y2="23" />
    </g>
  );
}
