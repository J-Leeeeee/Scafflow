import {
  parse,
  type MathNode,
  type SymbolNode,
} from 'mathjs';

const COEFF_TOLERANCE = 1e-6;
const IMPLICIT_MULT_PATTERN = /(\d|\))([A-Za-z(])/g;

export function normalizeEquationNotation(value: string): string {
  let normalized = value.replace(/\s+/g, '');
  normalized = uppercaseVariables(normalized);
  normalized = insertImplicitMultiplication(normalized);
  return normalized;
}

export function equationsAreEquivalent(
  submitted: string | undefined,
  expected: string,
): boolean {
  if (!submitted?.trim()) return false;

  const normalizedSubmitted = normalizeEquationNotation(submitted);
  const normalizedExpected = normalizeEquationNotation(expected);

  if (normalizedSubmitted === normalizedExpected) return true;

  try {
    const submittedStandard = parseStandardForm(normalizedSubmitted);
    const expectedStandard = parseStandardForm(normalizedExpected);
    const variables = collectSymbols(submittedStandard, expectedStandard);
    const submittedCoeffs = linearCoefficientVector(submittedStandard, variables);
    const expectedCoeffs = linearCoefficientVector(expectedStandard, variables);
    return vectorsProportional(submittedCoeffs, expectedCoeffs);
  } catch {
    return false;
  }
}

function uppercaseVariables(expr: string): string {
  return expr.replace(/[A-Za-z][A-Za-z0-9]*/g, (token) => token.toUpperCase());
}

function insertImplicitMultiplication(expr: string): string {
  let previous = '';
  let current = expr;

  while (previous !== current) {
    previous = current;
    current = current.replace(IMPLICIT_MULT_PATTERN, '$1*$2');
  }

  return current;
}

function parseStandardForm(normalizedEquation: string): MathNode {
  const parts = normalizedEquation.split('=');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Equation must contain exactly one equals sign.');
  }

  return parse(`(${parts[0]})-(${parts[1]})`);
}

function collectSymbols(...nodes: MathNode[]): string[] {
  const symbols = new Set<string>();

  for (const node of nodes) {
    node.traverse((child) => {
      if (child.type === 'SymbolNode') {
        symbols.add((child as SymbolNode).name);
      }
    });
  }

  return [...symbols].sort();
}

function linearCoefficientVector(expr: MathNode, variables: string[]): number[] {
  const compiled = expr.compile();
  const zeroScope = Object.fromEntries(variables.map((variable) => [variable, 0]));
  const constantTerm = Number(compiled.evaluate(zeroScope));

  if (!Number.isFinite(constantTerm)) {
    throw new Error('Expression is not linear.');
  }

  const coeffs = [constantTerm];

  for (const variable of variables) {
    const unitScope = Object.fromEntries(
      variables.map((name) => [name, name === variable ? 1 : 0]),
    );
    const valueAtUnit = Number(compiled.evaluate(unitScope));
    if (!Number.isFinite(valueAtUnit)) {
      throw new Error('Expression is not linear.');
    }

    const variableCoeff = valueAtUnit - constantTerm;
    coeffs.push(variableCoeff);
  }

  return coeffs;
}

function vectorsProportional(a: number[], b: number[]): boolean {
  const allZero = (values: number[]) => values.every(
    (value) => Math.abs(value) <= COEFF_TOLERANCE,
  );

  if (allZero(a) && allZero(b)) return true;
  if (allZero(a) || allZero(b)) return false;

  let ratio: number | null = null;

  for (let index = 0; index < a.length; index += 1) {
    const submitted = a[index];
    const expected = b[index];

    if (Math.abs(expected) <= COEFF_TOLERANCE) {
      if (Math.abs(submitted) > COEFF_TOLERANCE) return false;
      continue;
    }

    const nextRatio = submitted / expected;
    if (ratio === null) {
      ratio = nextRatio;
      continue;
    }

    if (Math.abs(nextRatio - ratio) > COEFF_TOLERANCE * Math.max(1, Math.abs(ratio))) {
      return false;
    }
  }

  return ratio !== null;
}
