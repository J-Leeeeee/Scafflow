import {
  equationsAreEquivalent,
  normalizeEquationNotation,
} from './equation-grading';

const KCL_EQ1 = '(VA-9)/20+(VA-VB)/60-1.8=0';
const KCL_EQ2 = '(VB-VA)/60+VB/25+VB/10=0';

const MESH_EQ1 = '5*I1 + 20*(I1 - I2) = 9';
const MESH_EQ2 = '20*(I2 - I1) + 25*I2 + 60*(I2 - I3) = 0';
const MESH_EQ3 = '60*(I3 - I2) + 10*I3 = 0';

describe('normalizeEquationNotation', () => {
  it('strips whitespace and uppercases variables', () => {
    expect(normalizeEquationNotation('(Va - 9) / 20 + (Va - Vb) / 60 - 1.8 = 0'))
      .toBe('(VA-9)/20+(VA-VB)/60-1.8=0');
  });

  it('inserts implicit multiplication', () => {
    expect(normalizeEquationNotation('5(I1-I2)+5I1=9'))
      .toBe('5*(I1-I2)+5*I1=9');
  });
});

describe('equationsAreEquivalent', () => {
  describe('KCL step 7', () => {
    it('accepts canonical equations', () => {
      expect(equationsAreEquivalent(KCL_EQ1, KCL_EQ1)).toBe(true);
      expect(equationsAreEquivalent(KCL_EQ2, KCL_EQ2)).toBe(true);
    });

    it('accepts spaced forms and alternate variable casing', () => {
      expect(equationsAreEquivalent(
        '(Va - 9) / 20 + (Va - Vb) / 60 - 1.8 = 0',
        KCL_EQ1,
      )).toBe(true);
      expect(equationsAreEquivalent(
        '(VB - VA) / 60 + Vb / 25 + vb / 10 = 0',
        KCL_EQ2,
      )).toBe(true);
    });

    it('accepts rearranged equals forms', () => {
      expect(equationsAreEquivalent(
        '(VA-9)/20+(VA-VB)/60=1.8',
        KCL_EQ1,
      )).toBe(true);
    });

    it('accepts sign-flipped whole equations', () => {
      expect(equationsAreEquivalent(
        '-(VA-9)/20-(VA-VB)/60+1.8=0',
        KCL_EQ1,
      )).toBe(true);
    });

    it('accepts scaled equations', () => {
      expect(equationsAreEquivalent(
        '20*((VA-9)/20+(VA-VB)/60-1.8)=0',
        KCL_EQ1,
      )).toBe(true);
    });

    it('rejects wrong coefficients', () => {
      expect(equationsAreEquivalent(
        '(VA-9)/20+(VA-VB)/30-1.8=0',
        KCL_EQ1,
      )).toBe(false);
    });

    it('rejects missing terms', () => {
      expect(equationsAreEquivalent(
        '(VA-9)/20-1.8=0',
        KCL_EQ1,
      )).toBe(false);
    });
  });

  describe('Mesh step 10', () => {
    it('accepts canonical equations', () => {
      expect(equationsAreEquivalent(MESH_EQ1, MESH_EQ1)).toBe(true);
      expect(equationsAreEquivalent(MESH_EQ2, MESH_EQ2)).toBe(true);
      expect(equationsAreEquivalent(MESH_EQ3, MESH_EQ3)).toBe(true);
    });

    it('accepts implicit multiplication and reordered terms', () => {
      expect(equationsAreEquivalent(
        '20(I1-I2)+5I1=9',
        MESH_EQ1,
      )).toBe(true);
      expect(equationsAreEquivalent(
        '20(I1-I2)+5*I1=9',
        MESH_EQ1,
      )).toBe(true);
      expect(equationsAreEquivalent(
        '5*I1+20*(I1-I2)=9',
        MESH_EQ1,
      )).toBe(true);
    });

    it('accepts equivalent parenthesis ordering for mesh 2', () => {
      expect(equationsAreEquivalent(
        '20(I2-I1)+25I2+60(I2-I3)=0',
        MESH_EQ2,
      )).toBe(true);
    });

    it('accepts scaled mesh equations', () => {
      expect(equationsAreEquivalent(
        '2*(5*I1 + 20*(I1 - I2)) = 18',
        MESH_EQ1,
      )).toBe(true);
    });

    it('rejects wrong mesh coefficients', () => {
      expect(equationsAreEquivalent(
        '5*I1 + 25*(I1 - I2) = 9',
        MESH_EQ1,
      )).toBe(false);
    });
  });

  describe('invalid input', () => {
    it('rejects empty or malformed submissions', () => {
      expect(equationsAreEquivalent('', KCL_EQ1)).toBe(false);
      expect(equationsAreEquivalent(undefined, KCL_EQ1)).toBe(false);
      expect(equationsAreEquivalent('not an equation', KCL_EQ1)).toBe(false);
      expect(equationsAreEquivalent('VA=VB=0', KCL_EQ1)).toBe(false);
    });
  });
});
