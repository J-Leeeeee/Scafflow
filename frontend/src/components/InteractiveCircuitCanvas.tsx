import { useState } from 'react';
import { CurrentSource, Resistor, VoltageSource } from '../design/components/circuit-symbols';
import { parseCircuitCanvasState, type CircuitCanvasState } from '../lib/circuitCanvas';

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

export function InteractiveCircuitCanvas({
  onChange,
  initialState,
}: {
  onChange: (state: string) => void;
  initialState?: string;
}) {
  const parsedInitial = parseCircuitCanvasState(initialState ?? null);
  const [isShorted, setIsShorted] = useState(parsedInitial?.isShorted ?? false);
  const [loops, setLoops] = useState<Record<number, string>>(parsedInitial?.loops ?? {});
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);

  const handleTerminalClick = (term: string) => {
    if (activeTerminal && activeTerminal !== term) {
      setIsShorted(true);
      setActiveTerminal(null);
      onChange(JSON.stringify({ isShorted: true, loops }));
    } else {
      setActiveTerminal(term);
    }
  };

  const handleLoopClick = (idx: number) => {
    const nextLoops = { ...loops };
    if (!nextLoops[idx]) {
      nextLoops[idx] = `i${idx + 1}`;
    } else {
      delete nextLoops[idx];
    }
    setLoops(nextLoops);
    onChange(JSON.stringify({ isShorted, loops: nextLoops }));
  };

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
          <strong>Instructions:</strong> Click terminal <strong>a</strong> and then <strong>b</strong> to short them together. Click inside the three circuit loops to add mesh current labels.
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

            <g className="cursor-pointer" onClick={() => handleLoopClick(0)}>
              <circle cx="110" cy="40" r="20" fill="transparent" />
              {loops[0] && <MeshMarker cx={110} cy={40} label={loops[0]} />}
            </g>
            <g className="cursor-pointer" onClick={() => handleLoopClick(1)}>
              <circle cx="200" cy="40" r="20" fill="transparent" />
              {loops[1] && <MeshMarker cx={200} cy={40} label={loops[1]} />}
            </g>
            <g className="cursor-pointer" onClick={() => handleLoopClick(2)}>
              <circle cx="150" cy="-25" r="20" fill="transparent" />
              {loops[2] && <MeshMarker cx={150} cy="-25" label={loops[2]} />}
            </g>

            {isShorted && (
              <polyline points="280,0 300,0 300,80 280,80" stroke="#615FFF" strokeWidth="2.5" fill="none" />
            )}

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
          </svg>
        </div>
      </div>
    </main>
  );
}

function MeshMarker({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill="#1F2937" />
      <text
        x={cx}
        y={cy}
        fontSize="11"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  );
}
