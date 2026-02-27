class IssueClassifier {
  /**
   * Classifica o tipo de issue para filtros do painel.
   * @param {string} issueName
   * @returns {'flex'|'grid'|'overflow'|'other'}
   */
  static getType(issueName) {
    if (!issueName || typeof issueName !== 'string') return 'other';
    const n = issueName.toLowerCase();
    if (n.includes('flex') || n.includes('basis')) return 'flex';
    if (n.includes('grid')) return 'grid';
    if (n.includes('overflow') || n.includes('viewport') || n.includes('100vw')) return 'overflow';
    return 'other';
  }
}

module.exports = { IssueClassifier };
