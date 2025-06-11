import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Safely calculate the result of a mathematical formula
 * @param formula Calculation formula (e.g.: "count * (Math.ceil(time / 5))+((w+h)/10000)*0.003" or "user.profile.age + 10")
 * @param data Data object
 * @param defaultValues Default values object, used when values are not found in data
 * @returns Calculation result (with 7 decimal places)
 */
export function calculateFormula(
  formula: string,
  data: Record<string, any>,
  defaultValues: Record<string, any> = {}
): number {
  // Validate formula format
  if (!formula || typeof formula !== "string") {
    throw new Error("Formula must be a non-empty string")
  }

  // Built-in configuration
  const precision = 7
  const allowedMathFunctions = [
    'ceil', 'floor', 'round', 'abs',
    'min', 'max', 'pow', 'sqrt',
    'sin', 'cos', 'tan', 'log',
    'exp', 'random'
  ]

  // Check for suspicious characters (allow numbers, operators, dots, letters, underscores, spaces)
  // Add support for Math. but restrict the function names that follow
  // Validate for suspicious characters
  const suspiciousPattern = /[;]|console\.|alert\.|&&/;
  if (suspiciousPattern.test(formula)) {
    throw new Error("Formula contains invalid characters");
  }

  // Validate Math function calls and temporarily replace them
  const mathPattern = new RegExp(`Math\\.(${allowedMathFunctions.join('|')})\\(`, 'g');
  const mathCalls = formula.match(mathPattern) || [];
  let tempFormula = formula;
  console.log("Original formula:", formula);
  console.log("Math calls:", mathCalls);
  for (const call of mathCalls) {
    tempFormula = tempFormula.replace(call, 'M'.repeat(call.length));
  }
  console.log("Temp formula after Math replacement:", tempFormula);

  // Validate basic characters
  const validPattern = /^[0-9\s\.\+\-\*\/\(\)\w\s,]+$/;
  if (!validPattern.test(tempFormula)) {
    throw new Error("Formula contains invalid characters");
  }
  // Validate Math function calls
  for (const call of mathCalls) {
    const funcName = call.substring(5, call.length - 1);
    if (!allowedMathFunctions.includes(funcName)) {
      throw new Error(`Invalid Math method call: ${call}`);
    }
  }

  // This code has been implemented above, no need to repeat

  try {
    // Helper function: safely get value from nested object
    const getValue = (path: string, dataObj: Record<string, any>, defaultObj: Record<string, any>): any => {
      const parts = path.split('.');
      let current: any = dataObj;
      let valueFoundInData = true;

      for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null || typeof current !== 'object' || !current.hasOwnProperty(parts[i])) {
          valueFoundInData = false;
          break;
        }
        current = current[parts[i]];
      }

      if (valueFoundInData && current !== undefined && current !== null && current !== "") {
        return current;
      }

      // If not found or invalid in data, try to get from defaultValues
      current = defaultObj;
      let valueFoundInDefault = true;
      for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null || typeof current !== 'object' || !current.hasOwnProperty(parts[i])) {
          valueFoundInDefault = false;
          break;
        }
        current = current[parts[i]];
      }
      if (valueFoundInDefault && current !== undefined && current !== null && current !== "") {
        return current;
      }
      return undefined; // Not found in either
    };

    // 1. Extract all potential variable names (including cascaded paths)
    const variableRegex = /\b([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)\b/g; // Match 'varName' or 'obj.prop.nested'
    const extractedVariables = new Set<string>();
    let match;
    while ((match = variableRegex.exec(formula)) !== null) {
      const varName = match[1];
      // Exclude Math. function calls and pure numbers
      if (!varName.startsWith('Math.') && isNaN(Number(varName))) {
        extractedVariables.add(varName);
      }
    }

    // 2. Parse variable values and build arguments to pass to Function
    const functionArgs: string[] = []; // Parameter names like '_var0', '_var1'
    const functionArgValues: any[] = []; // Parameter values
    const variableMap: Record<string, string> = {}; // Mapping from original variable path to safe parameter name
    let varIndex = 0;

    extractedVariables.forEach(varPath => {
      const value = getValue(varPath, data, defaultValues);

      if (value === undefined) {
        throw new Error(`Missing value for variable: ${varPath}`);
      }
      if (typeof value !== "number") {
        throw new Error(`Variable ${varPath} must be a number`);
      }

      const argName = `_var${varIndex++}`;
      variableMap[varPath] = argName;
      functionArgs.push(argName);
      functionArgValues.push(value);
    });

    // 3. Replace original variable paths in formula with safe parameter names
    let finalFormula = formula;
    // Sort by path length in descending order to avoid 'user' replacing part of 'user.name'
    const sortedVariables = Array.from(extractedVariables).sort((a, b) => b.length - a.length);
    sortedVariables.forEach(varPath => {
      const safeArgName = variableMap[varPath];
      // Use regex for global replacement, ensuring complete word matching
      finalFormula = finalFormula.replace(new RegExp(`\\b${varPath.replace(/\./g, '\\.')}\\b`, 'g'), safeArgName);
    });
    // Create safe Math function object
    const injectedFunctionArgs: string[] = [];
    const injectedFunctionValues: Function[] = [];

    allowedMathFunctions.forEach(fn => {
      const mathFn = Math[fn as keyof typeof Math];
      if (typeof mathFn === 'function') {
        injectedFunctionArgs.push(fn);
        injectedFunctionValues.push(mathFn);
      }
    });

    const calculateFn = new Function(
      ...functionArgs, // Variable parameters like '_var0', '_var1'
      ...injectedFunctionArgs, // Math function parameters like 'ceil', 'floor'
      `
      // Rebuild the Math object inside the function so the formula can use Math.xxx directly
      const Math = {
        ${allowedMathFunctions.map(fn => `${fn}: ${fn}`).join(',\n        ')}
      };

      try {
        const result = ${finalFormula};
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error('Invalid calculation result');
        }
        return Number(result.toFixed(${precision}));
      } catch (error) {
        throw new Error('Error in formula calculation: ' + error.message);
      }
    `);

    // Execute calculation
    return calculateFn(...functionArgValues, ...injectedFunctionValues);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error calculating formula: ${error.message}`);
    }
    throw new Error('An unknown error occurred while calculating formula');
  }
}
