import { MathAnswerInput } from '../../../components/MathAnswerInput';
import type { LabeledEquationsStepDef, StepState } from '../../types';

interface LabeledEquationsStepProps {
  step: LabeledEquationsStepDef;
  state: StepState;
  values?: string[];
  onChange?: (index: number, value: string) => void;
}

/**
 * Step 7 (KCL) and step 10 (MESH): a stack of labeled textareas.
 *
 * Step 7 specifically uses progressive reveal — empty state shows 1
 * textarea, filled shows 2 (first one with the equation, second empty),
 * checked shows both filled. We honor whatever shape lives in the fixtures
 * for each state.
 *
 * When `step.valueField` is set (e.g. Profile 3's merged KCL + Vth screen) a
 * trailing numeric input is rendered after the equations. The controlled
 * `values` array is flat: indices 0..N-1 are equations, index N is the value,
 * where N is the canonical equation count (`step.checked.equations.length`).
 */
export function LabeledEquationsStep({
  step,
  state,
  values: controlledValues,
  onChange,
}: LabeledEquationsStepProps) {
  const equationCount = step.checked.equations.length;

  const equations = controlledValues
    ? controlledValues.slice(0, equationCount)
    : (state === 'filled' ? step.filled.equations
      : state === 'checked' ? step.checked.equations
        : step.empty.equations);

  const valueFieldValue = step.valueField
    ? (controlledValues
      ? controlledValues[equationCount] ?? ''
      : state === 'filled' ? step.filled.value ?? ''
        : state === 'checked' ? step.checked.value ?? ''
          : '')
    : undefined;

  return (
    <div className="mt-4 space-y-3">
      {equations.map((value, index) => (
        <div key={`${step.prefix}-${index}`}>
          <MathAnswerInput
            value={value}
            onChange={(next) => onChange?.(index, next)}
            label={`${step.prefix} ${index + 1}:`}
            labelClassName="block text-[12px] font-medium tracking-[0.05em] text-[#5D5D5D] uppercase"
            multiline
            rows={value ? 2 : 2}
            inputClassName={`mt-1.5 w-full resize-none rounded-md border bg-white px-3 py-2 font-mono text-[13px] text-black ${
              value
                ? 'border-[#10B981] outline-2 outline-[#10B98133]'
                : 'border-[#E5E7EB]'
            }`}
            renderClassName="pointer-events-none absolute inset-x-0 bottom-0 top-1.5 overflow-auto rounded-md px-3 py-2 text-[13px] text-black"
          />
        </div>
      ))}

      {step.valueField && (
        <div className="pt-1">
          <p className="text-[14px] font-bold text-black">{step.valueField.fieldLabel}</p>
          <div className="mt-2 flex items-start gap-2">
            <span className="pt-2 text-[14px] font-semibold text-black">{step.valueField.leftLabel}</span>
            <div className="min-w-0 flex-1">
              <MathAnswerInput
                value={valueFieldValue ?? ''}
                onChange={(next) => onChange?.(equationCount, next)}
                mathPreview={false}
                placeholder={step.valueField.placeholder ?? '0.00'}
                inputClassName={`h-10 w-full rounded-md border bg-white px-3 text-[14px] text-black ${
                  valueFieldValue ? 'border-[#10B981] outline-2 outline-[#10B98133]' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            <span className="pt-2 text-[14px] text-[#1E2939]">{step.valueField.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}
