/**
 * Box Model Sentinel - CSS Parser
 * Parser de CSS com suporte para @media queries
 */

/**
 * Strip CSS comments
 * @param {string} s
 * @returns {string}
 */
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Parse CSS declarations block into key-value pairs
 * @param {string} block
 * @returns {object}
 */
function parseDeclarations(block) {
  const obj = {};
  const lines = block.split(';');

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const i = line.indexOf(':');
    if (i === -1) continue;

    const k = line.slice(0, i).trim().toLowerCase();
    const v = line.slice(i + 1).trim();
    obj[k] = v;
  }

  return obj;
}

/**
 * Parse raw CSS string into rules with support for @media blocks
 * @param {string} raw
 * @returns {{rules: object[]}}
 */
function parseRules(raw) {
  const s = stripComments(raw);
  const rules = [];

  // Extract @media blocks with brace matching
  let i = 0;
  const mediaBlocks = [];

  while (i < s.length) {
    const idx = s.indexOf('@media', i);
    if (idx === -1) break;

    const headStart = idx + 6;
    const braceOpen = s.indexOf('{', headStart);
    if (braceOpen === -1) break;

    const cond = s.slice(headStart, braceOpen).trim();
    let depth = 1;
    let j = braceOpen + 1;

    while (j < s.length && depth > 0) {
      const ch = s[j];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      j++;
    }

    const body = s.slice(braceOpen + 1, j - 1);
    mediaBlocks.push({ full: s.slice(idx, j), condition: cond, body });
    i = j;
  }

  // Remove media blocks to get base CSS
  let rest = s;
  for (const mb of mediaBlocks) {
    rest = rest.replace(mb.full, '');
  }

  // Parse base rules
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let r;

  while ((r = ruleRegex.exec(rest)) != null) {
    const selector = r[1].trim();
    const decl = parseDeclarations(r[2]);
    rules.push({ selector, declarations: decl, at: null });
  }

  // Parse media inner rules
  for (const mb of mediaBlocks) {
    let rr;
    const innerRegex = /([^{]+)\{([^}]*)\}/g;

    while ((rr = innerRegex.exec(mb.body)) != null) {
      const selector = rr[1].trim();
      const decl = parseDeclarations(rr[2]);
      rules.push({ selector, declarations: decl, at: { type: 'media', condition: mb.condition } });
    }
  }

  return { rules };
}

module.exports = {
  parseRules,
  parseDeclarations,
  stripComments
};
