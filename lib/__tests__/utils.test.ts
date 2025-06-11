import { calculateFormula } from '../utils';

describe('calculateFormula', () => {
  // Normal case tests
  test('should correctly calculate basic arithmetic expressions', () => {
    expect(calculateFormula("1 + 2", {})).toBe(3);
    expect(calculateFormula("10 - 5", {})).toBe(5);
    expect(calculateFormula("4 * 3", {})).toBe(12);
    expect(calculateFormula("10 / 4", {})).toBe(2.5);
  });

  test('should correctly handle floating point precision, keeping 7 decimal places', () => {
    expect(calculateFormula("10 / 3", {})).toBeCloseTo(3.3333333, 7);
    expect(calculateFormula("1 / 7", {})).toBeCloseTo(0.1428571, 7);
  });

  test('should correctly handle complex mathematical expressions', () => {
    const data = { count: 10, time: 7, w: 1920, h: 1080 };
    const expected = 10 * (Math.ceil(7 / 5)) + ((1920 + 1080) / 10000) * 0.003;
    expect(calculateFormula("count * (Math.ceil(time / 5))+((w+h)/10000)*0.003", data)).toBeCloseTo(expected, 7);
  });

  test('should correctly use Math functions', () => {
    expect(calculateFormula("Math.ceil(3.14)", {})).toBe(4);
    expect(calculateFormula("Math.floor(3.99)", {})).toBe(3);
    expect(calculateFormula("Math.round(3.5)", {})).toBe(4);
    expect(calculateFormula("Math.abs(-10)", {})).toBe(10);
    expect(calculateFormula("Math.min(1, 5, 2)", {})).toBe(1);
    expect(calculateFormula("Math.max(1, 5, 2)", {})).toBe(5);
    expect(calculateFormula("Math.pow(2, 3)", {})).toBe(8);
    expect(calculateFormula("Math.sqrt(9)", {})).toBe(3);
    expect(calculateFormula("Math.sin(0)", {})).toBe(0);
    expect(calculateFormula("Math.cos(0)", {})).toBe(1);
    expect(calculateFormula("Math.tan(0)", {})).toBe(0);
    expect(calculateFormula("Math.log(1)", {})).toBe(0);
    expect(calculateFormula("Math.exp(0)", {})).toBe(1);
    // Math.random() cannot be precisely tested, but we can verify its return type and range
    const randomResult = calculateFormula("Math.random()", {});
    expect(typeof randomResult).toBe('number');
    expect(randomResult).toBeGreaterThanOrEqual(0);
    expect(randomResult).toBeLessThan(1);
  });

  test('should correctly replace variables from the data object', () => {
    const data = { a: 10, b: 20 };
    expect(calculateFormula("a + b", data)).toBe(30);
    expect(calculateFormula("a * 2 + b / 4", data)).toBe(10 * 2 + 20 / 4);
  });

  test('should use values from the default values object when missing in the data object', () => {
    const data = { a: 10 };
    const defaultValues = { b: 20 };
    expect(calculateFormula("a + b", data, defaultValues)).toBe(30);
  });

  test('should prioritize values from the data object over default values', () => {
    const data = { a: 10, b: 50 };
    const defaultValues = { b: 20 };
    expect(calculateFormula("a + b", data, defaultValues)).toBe(60);
  });

  test('should correctly handle object cascade access', () => {
    const data = {
      user: {
        profile: { age: 25 },
        settings: { theme: { fontSize: 16 } }
      }
    };
    expect(calculateFormula("user.profile.age + 10", data)).toBe(35);
    expect(calculateFormula("user.settings.theme.fontSize * 2", data)).toBe(32);
  });

  // Error case tests
  test('should throw an error when the formula is an empty string', () => {
    expect(() => calculateFormula("", {})).toThrow("Formula must be a non-empty string");
  });

  test('should throw an error when the formula is not a string', () => {
    // @ts-ignore
    expect(() => calculateFormula(null, {})).toThrow("Formula must be a non-empty string");
    // @ts-ignore
    expect(() => calculateFormula(undefined, {})).toThrow("Formula must be a non-empty string");
    // @ts-ignore
    expect(() => calculateFormula(123, {})).toThrow("Formula must be a non-empty string");
  });

  test('should throw an error when the formula contains suspicious characters', () => {
    expect(() => calculateFormula("1 + 2; alert('hack')", {})).toThrow("Formula contains invalid characters");
    expect(() => calculateFormula("console.log(1)", {})).toThrow("Formula contains invalid characters");
    expect(() => calculateFormula("1 + 2 && 3", {})).toThrow("Formula contains invalid characters");
  });

  test('should throw an error when a variable is missing and has no default value', () => {
    const data = { a: 10 };
    expect(() => calculateFormula("a + b", data)).toThrow("Missing value for variable: b");
  });

  test('should throw an error when a variable value is not a number', () => {
    const data = { a: 10, b: "hello" };
    expect(() => calculateFormula("a + b", data)).toThrow("Variable b must be a number");
  });

  test('should throw an error when the calculation result is not a number or not finite', () => {
    expect(() => calculateFormula("1 / 0", {})).toThrow("Error in formula calculation: Invalid calculation result");
    expect(() => calculateFormula("Math.sqrt(-1)", {})).toThrow("Error in formula calculation: Invalid calculation result");
  });
});