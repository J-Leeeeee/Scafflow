/**
 * Type contract for the Homework Set 1 mockup.
 *
 * This file is the eventual API contract for the backend scaffold endpoint.
 * Stage 4 of the conversion plan swaps the static fixtures import for
 * `problems.getScaffold(id)` and the runtime types should line up directly.
 *
 * Each `Step` is a discriminated union member keyed by `kind`. Every step
 * carries its three display states (empty / filled / checked) inline so the
 * showcase and interactive routes can render the same record three ways.
 */

export type StepState = 'empty' | 'filled' | 'checked';

export type FeedbackTone = 'success' | 'warning' | 'error';
export type CanvasTask = 'ground_node' | 'short_mesh';

export interface Feedback {
  tone: FeedbackTone;
  title: string;
  body: string;
}

export type CircuitOptionKind =
  | 'voltage_series'
  | 'current_series'
  | 'current_parallel'
  | 'voltage_parallel';

export interface McqOption {
  key: string;
  kind: CircuitOptionKind;
}

/** Text-card MCQ option (method picker: Nodal / Mesh / Source Transformation, etc.). */
export interface MethodOption {
  key: string;
  label: string;
  sublabel: string;
}

/** Highlight overlay drawn on top of the circuit diagram for a given step. */
export type CircuitOverlay =
  | 'none'
  | 'highlight_node_va'
  | 'highlight_terminals_ab'
  | 'mesh_loops'
  | 'mesh_loop_1';

export interface CommonStep {
  number: number;
  prompt: string;
  helperText?: string;
  actionLabel: string;
  circuitOverlay?: CircuitOverlay;
  canvasTask?: CanvasTask;
}

/**
 * MCQ step. Two visual styles share the same `selectedIndex` answer shape:
 *  - 'circuit' (default): 4 circuit-diagram tiles keyed by `options`.
 *  - 'method': text cards (label + sublabel) keyed by `methodOptions`.
 */
export type McqStepDef = CommonStep & {
  kind: 'mcq';
  filled: { selectedIndex: number };
  checked: { selectedIndex: number; feedback: Feedback };
} & (
  | { style?: 'circuit'; options: McqOption[]; methodOptions?: never }
  | { style: 'method'; methodOptions: MethodOption[]; options?: never }
);

export interface MultiValueStepDef extends CommonStep {
  kind: 'multi_value';
  inputs: Array<{ label: string; placeholder?: string }>;
  filled: { values: string[] };
  checked: { values: string[]; feedback: Feedback };
}

export interface SelectInDiagramStepDef extends CommonStep {
  kind: 'select_in_diagram';
  filled: { overlay: CircuitOverlay };
  checked: { overlay: CircuitOverlay; feedback: Feedback };
}

export interface NumericPlainStepDef extends CommonStep {
  kind: 'numeric_plain';
  fieldLabel?: string;
  filled: { value: string };
  checked: { value: string; feedback: Feedback };
}

export interface NumericUnitStepDef extends CommonStep {
  kind: 'numeric_unit';
  fieldLabel: string;
  leftLabel: string;
  unit: string;
  placeholder?: string;
  filled: { value: string };
  checked: { value: string; feedback: Feedback };
}

export interface LabeledEquationsStepDef extends CommonStep {
  kind: 'labeled_equations';
  prefix: string;
  /** Optional trailing numeric field merged onto the same screen (e.g. P3: KCL + Vth). */
  valueField?: { fieldLabel: string; leftLabel: string; unit: string; placeholder?: string };
  empty: { equations: string[]; value?: string };
  filled: { equations: string[]; value?: string };
  checked: { equations: string[]; value?: string; feedback: Feedback };
}

export interface DrawingTaskStepDef extends CommonStep {
  kind: 'drawing_task';
  filled: Record<string, never>;
  checked: { feedback: Feedback };
}

export interface PriorsThenInputStepDef extends CommonStep {
  kind: 'priors_then_input';
  priors: string[];
  fieldLabel: string;
  leftLabel: string;
  unit: string;
  placeholder?: string;
  filled: { value: string };
  checked: { value: string; feedback: Feedback };
}

export interface NumericField {
  fieldLabel: string;
  leftLabel: string;
  unit: string;
  placeholder?: string;
}

/** Two number+unit fields on a single screen (e.g. Profile 4: Vth + Rth). */
export interface DualNumericUnitStepDef extends CommonStep {
  kind: 'dual_numeric_unit';
  fields: NumericField[];
  filled: { values: string[] };
  checked: { values: string[]; feedback: Feedback };
}

export type Step =
  | McqStepDef
  | MultiValueStepDef
  | SelectInDiagramStepDef
  | NumericPlainStepDef
  | NumericUnitStepDef
  | LabeledEquationsStepDef
  | DrawingTaskStepDef
  | PriorsThenInputStepDef
  | DualNumericUnitStepDef;

export type StepKind = Step['kind'];
