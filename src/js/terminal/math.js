/**
 * Error raised when a terminal math expression cannot be evaluated.
 * The message is intentionally suitable for showing directly in the UI.
 */
export class MathExpressionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MathExpressionError';
  }
}

const NUMBER_PATTERN = /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/y;

/**
 * Safely evaluates a small arithmetic language. This parser deliberately does
 * not use eval, Function, or JavaScript expression parsing, so input cannot
 * run arbitrary code.
 *
 * Supported operators: +, -, *, /, %, ^ and parentheses. Exponentiation is
 * right-associative: 2 ^ 3 ^ 2 equals 512. Unary plus and minus are supported.
 *
 * @param {string} expression
 * @returns {number}
 * @throws {MathExpressionError} when the expression is invalid or non-finite.
 */
export function evaluateMathExpression(expression) {
  if (typeof expression !== 'string') {
    throw new MathExpressionError('Expression must be text.');
  }

  const parser = new MathExpressionParser(expression);
  return parser.parse();
}

class MathExpressionParser {
  constructor(source) {
    this.source = source;
    this.position = 0;
  }

  parse() {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      throw new MathExpressionError('Enter a math expression to calculate.');
    }

    const value = this.parseAddition();
    this.skipWhitespace();

    if (!this.isAtEnd()) {
      const character = this.peek();
      if (character === ')') {
        throw this.errorAt('Unexpected closing parenthesis');
      }

      if (this.isOperator(character) || character === '(' || this.isNumberStart(character)) {
        throw this.errorAt(`Expected an operator before "${character}"`);
      }

      throw this.errorAt(`Unsupported character "${character}"`);
    }

    return this.ensureFinite(value);
  }

  parseAddition() {
    let value = this.parseMultiplication();

    while (true) {
      this.skipWhitespace();

      if (this.consume('+')) {
        value = this.ensureFinite(value + this.parseMultiplication());
      } else if (this.consume('-')) {
        value = this.ensureFinite(value - this.parseMultiplication());
      } else {
        return value;
      }
    }
  }

  parseMultiplication() {
    let value = this.parseUnary();

    while (true) {
      this.skipWhitespace();

      if (this.consume('*')) {
        value = this.ensureFinite(value * this.parseUnary());
      } else if (this.consume('/')) {
        const operatorPosition = this.position - 1;
        const divisor = this.parseUnary();
        if (divisor === 0) {
          throw this.errorAtPosition('Division by zero is not allowed', operatorPosition);
        }
        value = this.ensureFinite(value / divisor);
      } else if (this.consume('%')) {
        const operatorPosition = this.position - 1;
        const divisor = this.parseUnary();
        if (divisor === 0) {
          throw this.errorAtPosition('Remainder by zero is not allowed', operatorPosition);
        }
        value = this.ensureFinite(value % divisor);
      } else {
        return value;
      }
    }
  }

  parseUnary() {
    this.skipWhitespace();

    if (this.consume('+')) {
      return this.parseUnary();
    }

    if (this.consume('-')) {
      return this.ensureFinite(-this.parseUnary());
    }

    return this.parsePower();
  }

  parsePower() {
    let value = this.parsePrimary();
    this.skipWhitespace();

    if (this.consume('^')) {
      // Parsing the exponent as a unary expression makes 2^-3 valid while
      // retaining right-associativity for 2^3^2.
      const exponent = this.parseUnary();
      value = this.ensureFinite(value ** exponent);
    }

    return value;
  }

  parsePrimary() {
    this.skipWhitespace();

    if (this.consume('(')) {
      const value = this.parseAddition();
      this.skipWhitespace();

      if (!this.consume(')')) {
        throw this.errorAt('Expected ")" to close the parenthesis');
      }

      return value;
    }

    return this.parseNumber();
  }

  parseNumber() {
    this.skipWhitespace();
    const start = this.position;
    NUMBER_PATTERN.lastIndex = start;
    const match = NUMBER_PATTERN.exec(this.source);

    if (!match) {
      if (this.isAtEnd()) {
        throw new MathExpressionError('Expression cannot end with an operator.');
      }

      const character = this.peek();
      if (character === ')') {
        throw this.errorAt('Expected a number or "(" before ")"');
      }

      if (this.isOperator(character)) {
        throw this.errorAt(`Expected a number or "(" before "${character}"`);
      }

      throw this.errorAt(`Expected a number or "(" but found "${character}"`);
    }

    this.position = NUMBER_PATTERN.lastIndex;
    const value = Number(match[0]);

    return this.ensureFinite(value);
  }

  consume(character) {
    if (this.peek() !== character) {
      return false;
    }

    this.position += 1;
    return true;
  }

  peek() {
    return this.source[this.position];
  }

  isAtEnd() {
    return this.position >= this.source.length;
  }

  skipWhitespace() {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.position += 1;
    }
  }

  isNumberStart(character) {
    return character === '.' || (character >= '0' && character <= '9');
  }

  isOperator(character) {
    return character === '+' || character === '-' || character === '*' || character === '/' || character === '%' || character === '^';
  }

  ensureFinite(value) {
    if (Number.isNaN(value)) {
      throw new MathExpressionError('Result is not a real number.');
    }

    if (!Number.isFinite(value)) {
      throw new MathExpressionError('Result is outside the supported range.');
    }

    return value;
  }

  errorAt(message) {
    return this.errorAtPosition(message, this.position);
  }

  errorAtPosition(message, position) {
    return new MathExpressionError(`${message} at position ${position + 1}.`);
  }
}
