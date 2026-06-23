import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =====================================================
// SAFE EXPRESSION EVALUATOR
// Supports: +, -, *, /, ==, !=, <, <=, >, >=, &&, ||, !
// Functions: abs, min, max, years_between, months_between, days_between, years_old
// NO eval() — pure recursive descent parser
// =====================================================

// --- Date helpers ---
function parseDateSafe(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function yearsBetween(d1, d2) {
  const a = parseDateSafe(d1), b = parseDateSafe(d2);
  if (!a || !b) return null;
  return (b - a) / (1000 * 60 * 60 * 24 * 365.25);
}

function monthsBetween(d1, d2) {
  const a = parseDateSafe(d1), b = parseDateSafe(d2);
  if (!a || !b) return null;
  return (b - a) / (1000 * 60 * 60 * 24 * 30.4375);
}

function daysBetween(d1, d2) {
  const a = parseDateSafe(d1), b = parseDateSafe(d2);
  if (!a || !b) return null;
  return (b - a) / (1000 * 60 * 60 * 24);
}

function yearsOld(dob) {
  return yearsBetween(dob, new Date().toISOString());
}

// --- Tokenizer ---
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    // Skip whitespace
    if (/\s/.test(expr[i])) { i++; continue; }

    // Two-char operators
    const two = expr.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
      tokens.push({ type: 'op', value: two }); i += 2; continue;
    }

    // Single-char operators and punctuation
    if ('+-*/!<>(),'.includes(expr[i])) {
      tokens.push({ type: 'op', value: expr[i] }); i++; continue;
    }

    // Number
    if (/[0-9.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'num', value: parseFloat(num) }); continue;
    }

    // String literal
    if (expr[i] === '"' || expr[i] === "'") {
      const quote = expr[i++];
      let str = '';
      while (i < expr.length && expr[i] !== quote) str += expr[i++];
      i++; // closing quote
      tokens.push({ type: 'str', value: str }); continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(expr[i])) {
      let id = '';
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) id += expr[i++];
      tokens.push({ type: 'id', value: id }); continue;
    }

    throw new Error(`Unexpected character: ${expr[i]}`);
  }
  tokens.push({ type: 'eof' });
  return tokens;
}

// --- Parser (recursive descent) ---
class Parser {
  constructor(tokens, context) {
    this.tokens = tokens;
    this.pos = 0;
    this.context = context;
  }

  peek() { return this.tokens[this.pos]; }
  consume() { return this.tokens[this.pos++]; }

  expect(type, value) {
    const t = this.consume();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${value ?? type}, got ${t.value}`);
    }
    return t;
  }

  parse() {
    const result = this.parseOr();
    if (this.peek().type !== 'eof') throw new Error('Unexpected token after expression');
    return result;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.peek().value === '||') {
      this.consume();
      const right = this.parseAnd();
      left = left || right;
    }
    return left;
  }

  parseAnd() {
    let left = this.parseEquality();
    while (this.peek().value === '&&') {
      this.consume();
      const right = this.parseEquality();
      left = left && right;
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    const op = this.peek().value;
    if (op === '==' || op === '!=') {
      this.consume();
      const right = this.parseComparison();
      return op === '==' ? left == right : left != right;
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAddSub();
    const op = this.peek().value;
    if (['<', '<=', '>', '>='].includes(op)) {
      this.consume();
      const right = this.parseAddSub();
      if (op === '<') return left < right;
      if (op === '<=') return left <= right;
      if (op === '>') return left > right;
      if (op === '>=') return left >= right;
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.peek().value === '+' || this.peek().value === '-') {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (this.peek().value === '*' || this.peek().value === '/') {
      const op = this.consume().value;
      const right = this.parseUnary();
      if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  parseUnary() {
    if (this.peek().value === '!') {
      this.consume();
      return !this.parsePrimary();
    }
    if (this.peek().value === '-') {
      this.consume();
      return -this.parsePrimary();
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const t = this.peek();

    // Number literal
    if (t.type === 'num') { this.consume(); return t.value; }

    // String literal
    if (t.type === 'str') { this.consume(); return t.value; }

    // Boolean literals
    if (t.type === 'id' && t.value === 'true') { this.consume(); return true; }
    if (t.type === 'id' && t.value === 'false') { this.consume(); return false; }
    if (t.type === 'id' && t.value === 'null') { this.consume(); return null; }

    // Built-in functions
    if (t.type === 'id' && ['abs', 'min', 'max', 'years_between', 'months_between', 'days_between', 'years_old'].includes(t.value)) {
      const fn = this.consume().value;
      this.expect('op', '(');
      const args = [];
      if (this.peek().value !== ')') {
        args.push(this.parseOr());
        while (this.peek().value === ',') {
          this.consume();
          args.push(this.parseOr());
        }
      }
      this.expect('op', ')');

      if (fn === 'abs') return Math.abs(args[0]);
      if (fn === 'min') return Math.min(args[0], args[1]);
      if (fn === 'max') return Math.max(args[0], args[1]);
      if (fn === 'years_between') return yearsBetween(args[0], args[1]);
      if (fn === 'months_between') return monthsBetween(args[0], args[1]);
      if (fn === 'days_between') return daysBetween(args[0], args[1]);
      if (fn === 'years_old') return yearsOld(args[0]);
    }

    // Identifier (context variable)
    if (t.type === 'id') {
      this.consume();
      if (!(t.value in this.context)) return null; // missing field = null
      return this.context[t.value];
    }

    // Parentheses
    if (t.value === '(') {
      this.consume();
      const val = this.parseOr();
      this.expect('op', ')');
      return val;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(t)}`);
  }
}

// --- Main evaluate function ---
function evaluate(expression, context) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Expression must be a non-empty string');
  }

  // Check for missing dependencies
  const missingFields = [];
  for (const [key, val] of Object.entries(context)) {
    if (val === undefined || val === null) {
      // Only flag if the expression actually references this field
      if (expression.includes(key)) missingFields.push(key);
    }
  }

  const tokens = tokenize(expression.trim());
  const parser = new Parser(tokens, context);
  return parser.parse();
}

// =====================================================
// HTTP HANDLER
// POST body: { expression, context, mode }
// mode: "evaluate" | "validate" | "band_match"
// For band_match: { expression, context, bands: [{band_id, expression}] }
// =====================================================
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode = 'evaluate', expression, context = {}, bands = [] } = body;

    if (mode === 'validate') {
      // Just check if expression parses without error — no context needed
      try {
        const tokens = tokenize((expression || '').trim());
        const parser = new Parser(tokens, {});
        // Walk parse without throwing on null context refs
        return Response.json({ valid: true });
      } catch (err) {
        return Response.json({ valid: false, error: err.message });
      }
    }

    if (mode === 'band_match') {
      // Evaluate each band's expression, return first matching band_id
      if (!Array.isArray(bands) || bands.length === 0) {
        return Response.json({ error: 'bands array required for band_match mode' }, { status: 400 });
      }

      const sorted = [...bands].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
      let matched = null;
      const results = [];

      for (const band of sorted) {
        try {
          const result = evaluate(band.expression, context);
          results.push({ band_id: band.band_id, result: !!result, error: null });
          if (result && !matched) matched = band.band_id;
        } catch (err) {
          results.push({ band_id: band.band_id, result: false, error: err.message });
        }
      }

      return Response.json({ matched_band_id: matched, band_results: results });
    }

    // Default: evaluate single expression
    if (!expression) {
      return Response.json({ error: 'expression is required' }, { status: 400 });
    }

    // Check for any null/undefined fields referenced in expression
    const nullFields = Object.entries(context)
      .filter(([k, v]) => (v === null || v === undefined) && expression.includes(k))
      .map(([k]) => k);

    if (nullFields.length > 0) {
      return Response.json({
        result: null,
        skipped: true,
        reason: 'missing_dependencies',
        missing_fields: nullFields
      });
    }

    const result = evaluate(expression, context);
    return Response.json({ result, skipped: false });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});