import type { Step } from './types';

/**
 * Hardcoded fixtures lifted from the "Profile Prototypes" Figma file
 * (node 29:423, "profile 1" section). 12 steps for Homework Set 1:
 * "Find the Thévenin equivalent at terminals a, b".
 *
 * Each step carries inline copy for the three display states the design
 * specifies (empty / filled / checked). When this mockup is wired to the
 * backend, the `filled` and `checked` blocks become server-returned data;
 * the `prompt`, `helperText`, and structural fields become part of the
 * scaffold definition.
 */

export const profile1Steps: Step[] = [
  {
    kind: 'mcq',
    number: 1,
    prompt: 'Recall: What does the Thévenin equivalent model looks like:',
    helperText: 'Choose the circuit that fulfills the requirements for a Thévenin equivalent circuit',
    actionLabel: 'Confirm Selection',
    options: [
      { key: 'A', kind: 'voltage_series' },
      { key: 'B', kind: 'current_series' },
      { key: 'C', kind: 'current_parallel' },
      { key: 'D', kind: 'voltage_parallel' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: 'A Thévenin equivalent is a voltage source in series with a resistance.',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 2,
    prompt: 'Identify 2 values for Thevenin equivalent',
    actionLabel: 'Check Solution',
    inputs: [
      { label: 'VALUE 1' },
      { label: 'VALUE 2' },
    ],
    filled: { values: ['Vth', 'Rth'] },
    checked: {
      values: ['Vth', 'Rth'],
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: 'For every Thevenin equivalent problem we need to find Vth and Rth',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 3,
    prompt: "Let's start from finding Vth.\nWhere is Vth in our diagram?",
    helperText:
      'Enter the voltage (in terms of its terminals) that corresponds to Vth in the circuit diagram above.',
    actionLabel: 'Check Solution',
    inputs: [{ label: 'Vth =', placeholder: 'e.g. Vxy' }],
    filled: { values: ['Vab'] },
    checked: {
      values: ['Vab'],
      feedback: {
        tone: 'success',
        title: 'Good',
        body: 'Vth is the open-circuit voltage measured between terminals a and b — Vab.',
      },
    },
  },
  {
    kind: 'select_in_diagram',
    number: 4,
    prompt: 'Use Nodal Analysis to find Vth. Choose a ground node.',
    helperText: 'Select a reference/ground node by clicking on a node on the circuit below.',
    actionLabel: 'Confirm Selection',
    canvasTask: 'ground_node',
    filled: { overlay: 'highlight_node_va' },
    checked: {
      overlay: 'highlight_node_va',
      feedback: {
        tone: 'success',
        title: 'Nice',
        body: 'Picking the bottom rail as ground simplifies the KCL equations.',
      },
    },
  },
  {
    kind: 'numeric_plain',
    number: 5,
    prompt: 'Check: How many essential nodes are in the circuit above?',
    helperText: 'Examine the circuit above.',
    fieldLabel: 'Enter the number of essential nodes below:',
    actionLabel: 'Check Solution',
    filled: { value: '3' },
    checked: {
      value: '3',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'There are 3 essential nodes — Va, Vb, and ground.',
      },
    },
  },
  {
    kind: 'numeric_plain',
    number: 6,
    prompt: 'How many KCL equations do we need to solve for Vth',
    fieldLabel: 'Enter the number of equations we need:',
    actionLabel: 'Check Solution',
    filled: { value: '2' },
    checked: {
      value: '2',
      feedback: {
        tone: 'success',
        title: 'Right',
        body: 'With 3 essential nodes and one as ground, we need 2 KCL equations.',
      },
    },
  },
  {
    kind: 'labeled_equations',
    number: 7,
    prompt: 'Now set up your KCL equation at the highlighted node',
    actionLabel: 'Check Solution',
    prefix: 'KCL',
    circuitOverlay: 'highlight_node_va',
    empty: { equations: [''] },
    filled: { equations: ['(VA-9)/20+(VA-VB)/60-1.8=0', ''] },
    checked: {
      equations: ['(VA-9)/20+(VA-VB)/60-1.8=0', '(VB-VA)/60+VB/25+VB/10=0'],
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: 'Both node equations look right — solve them simultaneously next.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 8,
    prompt: 'Great, now solve the previous three KCL equations and get your value for Vth.',
    helperText: 'Calculate the Vth(remember Vth = Va - Vb)',
    fieldLabel: 'Value of Vth:',
    leftLabel: 'Vth =',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: 'Vth = 30 V — that matches the open-circuit voltage across terminals a–b.',
      },
    },
  },
  {
    kind: 'drawing_task',
    number: 9,
    prompt: 'Before we can find Rth, we need to find Isc.',
    helperText:
      'Using the interactive canvas on the right, short terminals a and b, then label all mesh currents needed to determine the short-circuit current.',
    actionLabel: 'Check Drawing',
    canvasTask: 'short_mesh',
    filled: {},
    checked: {
      feedback: {
        tone: 'success',
        title: 'Nice sketch',
        body: 'Your relabeled diagram shows the three mesh loops needed for Isc.',
      },
    },
  },
  {
    kind: 'labeled_equations',
    number: 10,
    prompt: 'Now set up the mesh current equations for the circuit above',
    actionLabel: 'Check Equations',
    prefix: 'MESH',
    circuitOverlay: 'mesh_loops',
    empty: { equations: ['', '', ''] },
    filled: {
      equations: [
        '5*I1 + 20*(I1 - I2) = 9',
        '20*(I2 - I1) + 25*I2 + 60*(I2 - I3) = 0',
        '60*(I3 - I2) + 10*I3 = 0',
      ],
    },
    checked: {
      equations: [
        '5*I1 + 20*(I1 - I2) = 9',
        '20*(I2 - I1) + 25*I2 + 60*(I2 - I3) = 0',
        '60*(I3 - I2) + 10*I3 = 0',
      ],
      feedback: {
        tone: 'success',
        title: 'Great',
        body: 'All three mesh equations are valid — solve for I3 to get Isc.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 11,
    prompt: 'Great, now solve and enter your value for Isc.',
    helperText:
      "Calculate the short-circuit current.(Think about what's the relation of Isc and I1, I2, and I3)",
    fieldLabel: 'Final value of Isc:',
    leftLabel: 'Isc =',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Right',
        body: 'Isc = 1.5 A — exactly the current through the shorted terminals.',
      },
    },
  },
  {
    kind: 'priors_then_input',
    number: 12,
    prompt: 'Great, now solve and enter your value for Rth.',
    helperText:
      'Recall the values for Vth and Isc you got before then calculate the final equivalent resistance.',
    priors: ['Vth = 30 V', 'Isc = 1.5 A'],
    fieldLabel: 'Final value of Rth:',
    leftLabel: 'Rth =',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: 'Rth = Vth / Isc = 30 / 1.5 = 20 Ω. The Thévenin equivalent is complete.',
      },
    },
  },
];

/**
 * The four demo profiles. Same homework assignment (the Thévenin problem),
 */
export type ProfileId = '1' | '2' | '3' | '4';

// Profile 2 ("exploring"): 11 steps. Drops Profile 1's essential-node count,
// while keeping the Vth setup, KCL, short-circuit, mesh, Isc, and Rth checks.
export const profile2Steps: Step[] = [
  {
    kind: 'mcq',
    number: 1,
    prompt: 'Which circuit form is the Thevenin equivalent?',
    helperText: 'Pick the source and resistor arrangement that matches the model.',
    actionLabel: 'Confirm Selection',
    options: [
      { key: 'A', kind: 'voltage_series' },
      { key: 'B', kind: 'current_series' },
      { key: 'C', kind: 'current_parallel' },
      { key: 'D', kind: 'voltage_parallel' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'The Thevenin model is a voltage source in series with a resistance.',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 2,
    prompt: 'What two values define the equivalent?',
    actionLabel: 'Check Solution',
    inputs: [
      { label: 'VALUE 1' },
      { label: 'VALUE 2' },
    ],
    filled: { values: ['Vth', 'Rth'] },
    checked: {
      values: ['Vth', 'Rth'],
      feedback: {
        tone: 'success',
        title: 'Right',
        body: 'You need Vth and Rth to specify the Thevenin equivalent.',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 3,
    prompt: 'For Vth, what voltage are you solving for?',
    helperText: 'Use terminal notation from the circuit.',
    actionLabel: 'Check Solution',
    inputs: [{ label: 'Vth =', placeholder: 'e.g. Vxy' }],
    filled: { values: ['Vab'] },
    checked: {
      values: ['Vab'],
      feedback: {
        tone: 'success',
        title: 'Good',
        body: 'Vth is the open-circuit terminal voltage Vab.',
      },
    },
  },
  {
    kind: 'select_in_diagram',
    number: 4,
    prompt: 'Choose a reference node for nodal analysis.',
    helperText: 'Select the ground node you would use before writing KCL on the interactive circuit canvas.',
    actionLabel: 'Confirm Selection',
    canvasTask: 'ground_node',
    filled: { overlay: 'highlight_node_va' },
    checked: {
      overlay: 'highlight_node_va',
      feedback: {
        tone: 'success',
        title: 'Nice choice',
        body: 'Using the bottom rail as ground leaves Va and Vb as the node voltages.',
      },
    },
  },
  {
    kind: 'numeric_plain',
    number: 5,
    prompt: 'How many KCL equations are needed?',
    fieldLabel: 'Number of equations:',
    actionLabel: 'Check Solution',
    filled: { value: '2' },
    checked: {
      value: '2',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'With ground chosen, the two unknown node voltages need 2 KCL equations.',
      },
    },
  },
  {
    kind: 'labeled_equations',
    number: 6,
    prompt: 'Write the KCL equations for Va and Vb.',
    actionLabel: 'Check Solution',
    prefix: 'KCL',
    circuitOverlay: 'highlight_node_va',
    empty: { equations: ['', ''] },
    filled: { equations: ['(VA-9)/20+(VA-VB)/60-1.8=0', ''] },
    checked: {
      equations: ['(VA-9)/20+(VA-VB)/60-1.8=0', '(VB-VA)/60+VB/25+VB/10=0'],
      feedback: {
        tone: 'success',
        title: 'Looks good',
        body: 'Those two KCL equations capture the open-circuit node voltages.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 7,
    prompt: 'Solve the KCL system for Vth.',
    helperText: 'Use Vth = Va - Vb.',
    fieldLabel: 'Value of Vth:',
    leftLabel: 'Vth =',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'Vth = 30 V from the open-circuit voltage across terminals a and b.',
      },
    },
  },
  {
    kind: 'drawing_task',
    number: 8,
    prompt: 'Short a-b and label the mesh currents for Isc.',
    helperText: 'Use the canvas to connect terminals a and b, then mark the loop currents.',
    actionLabel: 'Check Drawing',
    filled: {},
    checked: {
      feedback: {
        tone: 'success',
        title: 'Ready',
        body: 'The shorted circuit is set up for the short-circuit current calculation.',
      },
    },
  },
  {
    kind: 'labeled_equations',
    number: 9,
    prompt: 'Write the mesh-current equations.',
    actionLabel: 'Check Equations',
    prefix: 'MESH',
    circuitOverlay: 'mesh_loops',
    empty: { equations: ['', '', ''] },
    filled: {
      equations: [
        '5*I1 + 20*(I1 - I2) = 9',
        '20*(I2 - I1) + 25*I2 + 60*(I2 - I3) = 0',
        '60*(I3 - I2) + 10*I3 = 0',
      ],
    },
    checked: {
      equations: [
        '5*I1 + 20*(I1 - I2) = 9',
        '20*(I2 - I1) + 25*I2 + 60*(I2 - I3) = 0',
        '60*(I3 - I2) + 10*I3 = 0',
      ],
      feedback: {
        tone: 'success',
        title: 'Good equations',
        body: 'The mesh equations are consistent; solve them to get the short-circuit current.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 10,
    prompt: 'Enter the short-circuit current.',
    helperText: 'Use the mesh current through the shorted terminals.',
    fieldLabel: 'Value of Isc:',
    leftLabel: 'Isc =',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'Isc = 1.5 A through the short between terminals a and b.',
      },
    },
  },
  {
    kind: 'priors_then_input',
    number: 11,
    prompt: 'Compute the equivalent resistance.',
    helperText: 'Use the values you found for Vth and Isc.',
    priors: ['Vth = 30 V', 'Isc = 1.5 A'],
    fieldLabel: 'Value of Rth:',
    leftLabel: 'Rth =',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Complete',
        body: 'Rth = Vth / Isc = 30 / 1.5 = 20 Ω.',
      },
    },
  },
];

// Profile 3 ("distracted"): 6 steps. Merges the Vab, ground, KCL, and mesh
// scaffolds into direct checkpoints for model, values, Vth, short setup, Isc, Rth.
export const profile3Steps: Step[] = [
  {
    kind: 'mcq',
    number: 1,
    prompt: 'Goal: pick the Thevenin model.',
    helperText: 'Choose the equivalent circuit form.',
    actionLabel: 'Confirm Selection',
    options: [
      { key: 'A', kind: 'voltage_series' },
      { key: 'B', kind: 'current_series' },
      { key: 'C', kind: 'current_parallel' },
      { key: 'D', kind: 'voltage_parallel' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Yes',
        body: 'The Thevenin equivalent is a voltage source in series with a resistance.',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 2,
    prompt: 'Name the two target values.',
    actionLabel: 'Check Solution',
    inputs: [
      { label: 'VALUE 1' },
      { label: 'VALUE 2' },
    ],
    filled: { values: ['Vth', 'Rth'] },
    checked: {
      values: ['Vth', 'Rth'],
      feedback: {
        tone: 'success',
        title: 'Right',
        body: 'The target values are Vth and Rth.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 3,
    prompt: 'Find Vth.',
    helperText: 'Use the open-circuit voltage at a-b.',
    fieldLabel: 'Value of Vth:',
    leftLabel: 'Vth =',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'Vth = 30 V.',
      },
    },
  },
  {
    kind: 'drawing_task',
    number: 4,
    prompt: 'Short a-b for Isc.',
    helperText: 'Connect the terminals and label the loop currents.',
    actionLabel: 'Check Drawing',
    filled: {},
    checked: {
      feedback: {
        tone: 'success',
        title: 'Set',
        body: 'The short-circuit setup is ready for Isc.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 5,
    prompt: 'Find Isc.',
    helperText: 'Use the current through the shorted terminals.',
    fieldLabel: 'Value of Isc:',
    leftLabel: 'Isc =',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'Isc = 1.5 A.',
      },
    },
  },
  {
    kind: 'priors_then_input',
    number: 6,
    prompt: 'Find Rth.',
    helperText: 'Use Rth = Vth / Isc.',
    priors: ['Vth = 30 V', 'Isc = 1.5 A'],
    fieldLabel: 'Value of Rth:',
    leftLabel: 'Rth =',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Complete',
        body: 'Rth = 30 / 1.5 = 20 Ω.',
      },
    },
  },
];

// Profile 4 ("independent"): 3 steps. Drops intermediate scaffolding and keeps
// only the goal checkpoint plus direct Vth and Rth entries.
export const profile4Steps: Step[] = [
  {
    kind: 'multi_value',
    number: 1,
    prompt: 'Goal: find the Thevenin equivalent at terminals a, b.',
    helperText: 'Enter the two quantities that define it.',
    actionLabel: 'Check Solution',
    inputs: [
      { label: 'VALUE 1' },
      { label: 'VALUE 2' },
    ],
    filled: { values: ['Vth', 'Rth'] },
    checked: {
      values: ['Vth', 'Rth'],
      feedback: {
        tone: 'success',
        title: 'Ready',
        body: 'Find Vth and Rth for the equivalent.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 2,
    prompt: 'Enter Vth.',
    helperText: 'Open-circuit voltage at terminals a-b.',
    fieldLabel: 'Value of Vth:',
    leftLabel: 'Vth =',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Correct',
        body: 'Vth = 30 V.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 3,
    prompt: 'Enter Rth.',
    helperText: 'Equivalent resistance at terminals a-b.',
    fieldLabel: 'Value of Rth:',
    leftLabel: 'Rth =',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Complete',
        body: 'Rth = 20 Ω. The Thevenin equivalent is complete.',
      },
    },
  },
];

export const stepsByProfile: Record<ProfileId, Step[]> = {
  '1': profile1Steps,
  '2': profile2Steps,
  '3': profile3Steps,
  '4': profile4Steps,
};

export const mockSteps = profile1Steps;
export const TOTAL_STEPS = profile1Steps.length;
