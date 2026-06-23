import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Fetches contradiction_rules from QuestionPromptLibrary for the current field,
 * evaluates them against accumulated formData via safeExpressionEvaluator,
 * and returns active contradictions.
 *
 * Usage:
 *   const { contradictions, checkContradictions, clearContradictions } = useContradictionCheck();
 *   // call checkContradictions(fieldName, formData) after any field change
 */
export function useContradictionCheck() {
  const [contradictions, setContradictions] = useState([]); // [{ message, severity }]
  const rulesCache = useRef({}); // field_name → contradiction_rules[]

  /**
   * Load contradiction rules for a field (cached per session).
   */
  const getRulesForField = useCallback(async (fieldName) => {
    if (rulesCache.current[fieldName] !== undefined) {
      return rulesCache.current[fieldName];
    }
    const records = await base44.entities.QuestionPromptLibrary.filter(
      { field_name: fieldName, is_active: true },
      null,
      1
    );
    const rules = records[0]?.contradiction_rules || [];
    rulesCache.current[fieldName] = rules;
    return rules;
  }, []);

  /**
   * Check contradictions for a changed field against full formData.
   * Calls safeExpressionEvaluator backend for each rule.
   * Only fires if the field has contradiction_rules defined.
   */
  const checkContradictions = useCallback(async (fieldName, formData) => {
    const rules = await getRulesForField(fieldName);
    if (!rules || rules.length === 0) {
      setContradictions([]);
      return [];
    }

    const active = [];
    for (const rule of rules) {
      if (!rule.expression) continue;
      try {
        const res = await base44.functions.invoke('safeExpressionEvaluator', {
          mode: 'evaluate',
          expression: rule.expression,
          context: formData,
        });
        if (res?.data?.result === true) {
          active.push({ message: rule.message, severity: rule.severity || 'warning' });
        }
      } catch {
        // non-blocking — skip on error
      }
    }

    setContradictions(active);
    return active;
  }, [getRulesForField]);

  const clearContradictions = useCallback(() => setContradictions([]), []);

  return { contradictions, checkContradictions, clearContradictions };
}