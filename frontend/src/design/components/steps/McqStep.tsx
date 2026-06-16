import type { McqStepDef, StepState } from '../../types';
import { CircuitChoiceTile } from '../OptionCircuit';

interface McqStepProps {
  step: McqStepDef;
  state: StepState;
  selectedOptionIndex?: number;
  onSelect?: (index: number) => void;
}

export function McqStep({ step, state, selectedOptionIndex, onSelect }: McqStepProps) {
  const fixtureSelectedIndex =
    state === 'filled' ? step.filled.selectedIndex
      : state === 'checked' ? step.checked.selectedIndex
        : undefined;
  const selectedIndex = selectedOptionIndex ?? fixtureSelectedIndex;

  if (step.style === 'method') {
    return (
      <div className="mt-4 space-y-3">
        {step.methodOptions.map((option, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelect?.(index)}
              aria-pressed={selected}
              className={`w-full rounded-[10px] border p-3 text-left transition ${
                selected
                  ? 'border-[#615FFF] bg-[#615FFF0D] outline-2 outline-[#615FFF33]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#C7C6FF]'
              }`}
            >
              <p className="text-[14px] font-bold text-black">{option.label}</p>
              <p className="mt-0.5 text-[13px] leading-[19px] text-[#6A7282]">{option.sublabel}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))' }}>
      {step.options?.map((option, index) => (
        <CircuitChoiceTile
          key={option.key}
          kind={option.kind}
          selected={selectedIndex === index}
          ariaLabel={`Select answer choice ${option.key}`}
          onClick={() => onSelect?.(index)}
        />
      ))}
    </div>
  );
}
