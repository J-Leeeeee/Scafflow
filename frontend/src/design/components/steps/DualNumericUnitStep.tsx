import { MathAnswerInput } from '../../../components/MathAnswerInput';
import type { DualNumericUnitStepDef, StepState } from '../../types';

interface DualNumericUnitStepProps {
  step: DualNumericUnitStepDef;
  state: StepState;
  values?: string[];
  onChange?: (index: number, value: string) => void;
}

/** Profile 4: two "Vth = [ 0.00 ] V" style inputs stacked on one screen. */
export function DualNumericUnitStep({ step, state, values: controlledValues, onChange }: DualNumericUnitStepProps) {
  const values = controlledValues ?? (
    state === 'filled' ? step.filled.values
      : state === 'checked' ? step.checked.values
        : step.fields.map(() => '')
  );
  const filled = state !== 'empty';

  return (
    <div className="mt-3 space-y-4">
      {step.fields.map((field, index) => (
        <div key={field.leftLabel}>
          <p className="text-[14px] font-bold text-black">{field.fieldLabel}</p>
          <div className="mt-2 flex items-start gap-2">
            <span className="pt-2 text-[14px] font-semibold text-black">{field.leftLabel}</span>
            <div className="min-w-0 flex-1">
              <MathAnswerInput
                value={values[index] ?? ''}
                onChange={(next) => onChange?.(index, next)}
                mathPreview={false}
                placeholder={field.placeholder ?? '0.00'}
                inputClassName={`h-10 w-full rounded-md border bg-white px-3 text-[14px] text-black ${
                  filled ? 'border-[#10B981] outline-2 outline-[#10B98133]' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            <span className="pt-2 text-[14px] text-[#1E2939]">{field.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
