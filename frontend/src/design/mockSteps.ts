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
 *
 * Display copy may contain inline LaTeX wrapped in `$...$` (rendered by
 * <MathText>); answer/grading fields (`filled`/`checked` values + equations)
 * stay plain ASCII so the matching logic is unchanged.
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
        body: 'For every Thevenin equivalent problem we need to find $V_{\\mathrm{th}}$ and $R_{\\mathrm{th}}$',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 3,
    prompt: "Let's start from finding $V_{\\mathrm{th}}$.\nWhere is $V_{\\mathrm{th}}$ in our diagram?",
    helperText:
      'Enter the voltage (in terms of its terminals) that corresponds to $V_{\\mathrm{th}}$ in the circuit diagram above.',
    actionLabel: 'Check Solution',
    inputs: [{ label: '$V_{\\mathrm{th}} =$', placeholder: 'e.g. Vxy' }],
    filled: { values: ['Vab'] },
    checked: {
      values: ['Vab'],
      feedback: {
        tone: 'success',
        title: 'Good',
        body: '$V_{\\mathrm{th}}$ is the open-circuit voltage measured between terminals a and b — $V_{ab}$.',
      },
    },
  },
  {
    kind: 'select_in_diagram',
    number: 4,
    prompt: 'Use Nodal Analysis to find $V_{\\mathrm{th}}$. Choose a ground node.',
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
        body: 'There are 3 essential nodes — $V_a$, $V_b$, and ground.',
      },
    },
  },
  {
    kind: 'numeric_plain',
    number: 6,
    prompt: 'How many KCL equations do we need to solve for $V_{\\mathrm{th}}$',
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
    prompt: 'Great, now solve the previous three KCL equations and get your value for $V_{\\mathrm{th}}$.',
    helperText: 'Calculate the $V_{\\mathrm{th}}$ (remember $V_{\\mathrm{th}} = V_a - V_b$)',
    fieldLabel: 'Value of $V_{\\mathrm{th}}$:',
    leftLabel: '$V_{\\mathrm{th}} =$',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: '$V_{\\mathrm{th}} = 30\\,\\mathrm{V}$ — that matches the open-circuit voltage across terminals a–b.',
      },
    },
  },
  {
    kind: 'drawing_task',
    number: 9,
    prompt: 'Before we can find $R_{\\mathrm{th}}$, we need to find $I_{\\mathrm{sc}}$.',
    helperText:
      'Using the interactive canvas on the right, short terminals a and b, then label all mesh currents needed to determine the short-circuit current.',
    actionLabel: 'Check Drawing',
    canvasTask: 'short_mesh',
    filled: {},
    checked: {
      feedback: {
        tone: 'success',
        title: 'Nice sketch',
        body: 'Your relabeled diagram shows the three mesh loops needed for $I_{\\mathrm{sc}}$.',
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
        body: 'All three mesh equations are valid — solve for $I_3$ to get $I_{\\mathrm{sc}}$.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 11,
    prompt: 'Great, now solve and enter your value for $I_{\\mathrm{sc}}$.',
    helperText:
      "Calculate the short-circuit current.(Think about what's the relation of $I_{\\mathrm{sc}}$ and $I_1$, $I_2$, and $I_3$)",
    fieldLabel: 'Final value of $I_{\\mathrm{sc}}$:',
    leftLabel: '$I_{\\mathrm{sc}} =$',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Right',
        body: '$I_{\\mathrm{sc}} = 1.5\\,\\mathrm{A}$ — exactly the current through the shorted terminals.',
      },
    },
  },
  {
    kind: 'priors_then_input',
    number: 12,
    prompt: 'Great, now solve and enter your value for $R_{\\mathrm{th}}$.',
    helperText:
      'Recall the values for $V_{\\mathrm{th}}$ and $I_{\\mathrm{sc}}$ you got before then calculate the final equivalent resistance.',
    priors: ['$V_{\\mathrm{th}} = 30\\,\\mathrm{V}$', '$I_{\\mathrm{sc}} = 1.5\\,\\mathrm{A}$'],
    fieldLabel: 'Final value of $R_{\\mathrm{th}}$:',
    leftLabel: '$R_{\\mathrm{th}} =$',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: '$R_{\\mathrm{th}} = V_{\\mathrm{th}} / I_{\\mathrm{sc}} = 30 / 1.5 = 20\\,\\Omega$. The Thévenin equivalent is complete.',
      },
    },
  },
];

/**
 * The four demo profiles. Same homework assignment (the Thévenin problem),
 */
export type ProfileId = '1' | '2' | '3' | '4';

// Profile 2 ("exploring"): 11 steps. Drops Profile 1's model MCQ, ground-node,
// and essential-node steps; adds two method-picker MCQs (Vth method, Rth method).
export const profile2Steps: Step[] = [
  {
    kind: 'multi_value',
    number: 1,
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
        body: 'For every Thevenin equivalent problem we need to find $V_{\\mathrm{th}}$ and $R_{\\mathrm{th}}$',
      },
    },
  },
  {
    kind: 'multi_value',
    number: 2,
    prompt: "Let's start from finding $V_{\\mathrm{th}}$.\nWhere is $V_{\\mathrm{th}}$ in our diagram?",
    helperText:
      'Enter the voltage (in terms of its terminals) that corresponds to $V_{\\mathrm{th}}$ in the circuit diagram above.',
    actionLabel: 'Check Solution',
    inputs: [{ label: '$V_{\\mathrm{th}} =$', placeholder: 'e.g. Vxy' }],
    filled: { values: ['Vab'] },
    checked: {
      values: ['Vab'],
      feedback: {
        tone: 'success',
        title: 'Good',
        body: '$V_{\\mathrm{th}}$ is the open-circuit voltage measured between terminals a and b — $V_{ab}$.',
      },
    },
  },
  {
    kind: 'mcq',
    number: 3,
    style: 'method',
    prompt: 'Select Your Method',
    helperText: 'Which analysis method will you use to find $V_{\\mathrm{th}}$?',
    actionLabel: 'Confirm Method',
    methodOptions: [
      { key: 'A', label: 'Nodal Analysis', sublabel: 'Apply KCL at nodes to find voltage' },
      { key: 'B', label: 'Mesh Analysis', sublabel: 'Apply KVL to mesh currents' },
      { key: 'C', label: 'Source Transformation', sublabel: 'Simplify circuit by converting sources' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Good',
        body: 'Nodal analysis is a solid choice for finding $V_{\\mathrm{th}}$.',
      },
    },
  },
  {
    kind: 'numeric_plain',
    number: 4,
    prompt: 'How many KCL equations do we need to solve for $V_{\\mathrm{th}}$',
    helperText: 'Enter the number of equations we need:',
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
    number: 5,
    prompt: 'Now set up your KCL equation at the highlighted node',
    actionLabel: 'Check Solution',
    prefix: 'KCL',
    circuitOverlay: 'highlight_node_va',
    empty: { equations: ['', ''] },
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
    number: 6,
    prompt: 'Great, now solve the previous three KCL equations and get your value for $V_{\\mathrm{th}}$.',
    helperText: 'Calculate the $V_{\\mathrm{th}}$ (remember $V_{\\mathrm{th}} = V_a - V_b$)',
    fieldLabel: 'Value of $V_{\\mathrm{th}}$:',
    leftLabel: '$V_{\\mathrm{th}} =$',
    unit: 'V',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '30' },
    checked: {
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: '$V_{\\mathrm{th}} = 30\\,\\mathrm{V}$ — that matches the open-circuit voltage across terminals a–b.',
      },
    },
  },
  {
    kind: 'mcq',
    number: 7,
    style: 'method',
    prompt: 'Nice! Now we need to find $R_{\\mathrm{th}}$ using one of the following methods',
    helperText: 'Select your method:',
    actionLabel: 'Confirm Method',
    methodOptions: [
      { key: 'A', label: 'Use $I_{\\mathrm{sc}}$ (Short-circuit current)', sublabel: 'Find short-circuit current, then $R_{\\mathrm{th}} = V_{\\mathrm{th}} / I_{\\mathrm{sc}}$' },
      { key: 'B', label: 'Dead-network analysis', sublabel: 'Deactivate all sources and find equivalent resistance' },
      { key: 'C', label: 'Source Transformation', sublabel: 'Simplify circuit by converting sources' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Good',
        body: 'The $I_{\\mathrm{sc}}$ method pairs well with the $V_{\\mathrm{th}}$ you already found.',
      },
    },
  },
  {
    kind: 'drawing_task',
    number: 8,
    prompt: 'Before we can find $R_{\\mathrm{th}}$, we need to find $I_{\\mathrm{sc}}$.',
    helperText:
      'Using the sketchpad on the right, redraw the circuit diagram and label all mesh currents/node voltages needed to determine the short-circuit current.',
    actionLabel: 'Check Drawing',
    canvasTask: 'short_mesh',
    filled: {},
    checked: {
      feedback: {
        tone: 'success',
        title: 'Nice sketch',
        body: 'Your relabeled diagram shows the three mesh loops needed for $I_{\\mathrm{sc}}$.',
      },
    },
  },
  {
    kind: 'labeled_equations',
    number: 9,
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
        body: 'All three mesh equations are valid — solve for $I_3$ to get $I_{\\mathrm{sc}}$.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 10,
    prompt: 'Great, now solve and enter your value for $I_{\\mathrm{sc}}$.',
    helperText:
      "Calculate the short-circuit current. (Think about what's the relation of $I_{\\mathrm{sc}}$ and $I_1$, $I_2$, and $I_3$)",
    fieldLabel: 'Final value of $I_{\\mathrm{sc}}$:',
    leftLabel: '$I_{\\mathrm{sc}} =$',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Right',
        body: '$I_{\\mathrm{sc}} = 1.5\\,\\mathrm{A}$ — exactly the current through the shorted terminals.',
      },
    },
  },
  {
    kind: 'priors_then_input',
    number: 11,
    prompt: 'Great, now solve and enter your value for $R_{\\mathrm{th}}$.',
    helperText:
      'Recall the values for $V_{\\mathrm{th}}$ and $I_{\\mathrm{sc}}$ you got before then calculate the final equivalent resistance.',
    priors: ['$V_{\\mathrm{th}} = 30\\,\\mathrm{V}$', '$I_{\\mathrm{sc}} = 1.5\\,\\mathrm{A}$'],
    fieldLabel: 'Final value of $R_{\\mathrm{th}}$:',
    leftLabel: '$R_{\\mathrm{th}} =$',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: '$R_{\\mathrm{th}} = V_{\\mathrm{th}} / I_{\\mathrm{sc}} = 30 / 1.5 = 20\\,\\Omega$. The Thévenin equivalent is complete.',
      },
    },
  },
];

// Profile 3 ("distracted"): 6 steps. Opens with a Vth-method picker, merges the
// KCL setup and Vth solve onto one screen, then an Rth-method picker, Isc, Rth.
export const profile3Steps: Step[] = [
  {
    kind: 'mcq',
    number: 1,
    style: 'method',
    prompt: 'Select Your Method',
    helperText: 'Which analysis method will you use to find $V_{\\mathrm{th}}$?',
    actionLabel: 'Confirm Method',
    methodOptions: [
      { key: 'A', label: 'Nodal Analysis', sublabel: 'Apply KCL at nodes to find voltage' },
      { key: 'B', label: 'Mesh Analysis', sublabel: 'Apply KVL to mesh currents' },
      { key: 'C', label: 'Source Transformation', sublabel: 'Simplify circuit by converting sources' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Excellent Choice!',
        body: 'Nodal Analysis is perfect here because of the common reference node.',
      },
    },
  },
  {
    kind: 'select_in_diagram',
    number: 2,
    prompt: 'Set up your circuit and choose a reference / ground node.',
    helperText: 'Select a reference/ground node by clicking a node on the interactive circuit canvas.',
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
    kind: 'labeled_equations',
    number: 3,
    prompt: 'Now set up your KCL equations and enter your value for $V_{\\mathrm{th}}$.',
    helperText: 'Enter the correct KCL equations:',
    actionLabel: 'Check Solution',
    prefix: 'KCL',
    valueField: { fieldLabel: 'Final value of $V_{\\mathrm{th}}$:', leftLabel: '$V_{\\mathrm{th}} =$', unit: 'V', placeholder: '0.00' },
    empty: { equations: ['', '', ''] },
    filled: {
      equations: [
        '(V1-9)/5+V1/25+1.8=0',
        '(Va-9)/20+(Va-Vb)/60-1.8=0',
        '(Vb-Va)/60+Vb/10=0',
      ],
      value: '30',
    },
    checked: {
      equations: [
        '(V1-9)/5+V1/25+1.8=0',
        '(Va-9)/20+(Va-Vb)/60-1.8=0',
        '(Vb-Va)/60+Vb/10=0',
      ],
      value: '30',
      feedback: {
        tone: 'success',
        title: 'Excellent Choice!',
        body: 'Nodal Analysis is perfect here because of the common reference node.',
      },
    },
  },
  {
    kind: 'mcq',
    number: 4,
    style: 'method',
    prompt: 'Nice! Now we need to find $R_{\\mathrm{th}}$ using one of the following methods',
    helperText: 'Select your method:',
    actionLabel: 'Confirm Method',
    methodOptions: [
      { key: 'A', label: 'Use $I_{\\mathrm{sc}}$ (Short-circuit current)', sublabel: 'Find short-circuit current, then $R_{\\mathrm{th}} = V_{\\mathrm{th}} / I_{\\mathrm{sc}}$' },
      { key: 'B', label: 'Dead-network analysis', sublabel: 'Deactivate all sources and find equivalent resistance' },
      { key: 'C', label: 'Source Transformation', sublabel: 'Simplify circuit by converting sources' },
    ],
    filled: { selectedIndex: 0 },
    checked: {
      selectedIndex: 0,
      feedback: {
        tone: 'success',
        title: 'Excellent!',
        body: 'Using $I_{\\mathrm{sc}}$ is a reliable method to determine $R_{\\mathrm{th}}$ when sources are active.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 5,
    prompt: 'To find $I_{\\mathrm{sc}}$, connect terminals a and b with a wire.',
    helperText: 'This means: $V_a = V_b = V_{ab} = 0$. Write KCL at the merged node, then enter $I_{\\mathrm{sc}}$.',
    fieldLabel: 'Final value of $I_{\\mathrm{sc}}$:',
    leftLabel: '$I_{\\mathrm{sc}} =$',
    unit: 'A',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '1.5' },
    checked: {
      value: '1.5',
      feedback: {
        tone: 'success',
        title: 'Excellent!',
        body: '$I_{\\mathrm{sc}} = 1.5\\,\\mathrm{A}$ — the short-circuit current through terminals a–b.',
      },
    },
  },
  {
    kind: 'numeric_unit',
    number: 6,
    prompt: 'Great, now solve and enter your value for $R_{\\mathrm{th}}$.',
    helperText: 'Calculate the final equivalent resistance.',
    fieldLabel: 'Final value of $R_{\\mathrm{th}}$:',
    leftLabel: '$R_{\\mathrm{th}} =$',
    unit: 'Ω',
    placeholder: '0.00',
    actionLabel: 'Check Solution',
    filled: { value: '20' },
    checked: {
      value: '20',
      feedback: {
        tone: 'success',
        title: 'Excellent!',
        body: '$R_{\\mathrm{th}} = V_{\\mathrm{th}} / I_{\\mathrm{sc}} = 30 / 1.5 = 20\\,\\Omega$. The Thévenin equivalent is complete.',
      },
    },
  },
];

// Profile 4 ("independent"): 1 step. Drops all scaffolding — Vth and Rth are
// entered together on a single screen (the goal lives in the problem panel).
export const profile4Steps: Step[] = [
  {
    kind: 'dual_numeric_unit',
    number: 1,
    prompt: 'Solve the value for $V_{\\mathrm{th}}$ and $R_{\\mathrm{th}}$.',
    helperText: 'Use a proper method to solve for $V_{\\mathrm{th}}$ and $R_{\\mathrm{th}}$ (think about removing the $60\\,\\Omega$ resistor).',
    actionLabel: 'Check Solution',
    fields: [
      { fieldLabel: 'Find value of $V_{\\mathrm{th}}$:', leftLabel: '$V_{\\mathrm{th}} =$', unit: 'V', placeholder: '0.00' },
      { fieldLabel: 'Find value of $R_{\\mathrm{th}}$:', leftLabel: '$R_{\\mathrm{th}} =$', unit: 'Ω', placeholder: '0.00' },
    ],
    filled: { values: ['30', '20'] },
    checked: {
      values: ['30', '20'],
      feedback: {
        tone: 'success',
        title: 'Excellent',
        body: '$V_{\\mathrm{th}} = 30\\,\\mathrm{V}$ and $R_{\\mathrm{th}} = 20\\,\\Omega$. The Thévenin equivalent is complete.',
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
