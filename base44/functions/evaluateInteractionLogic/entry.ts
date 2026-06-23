import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Parser } from 'npm:expr-eval@2.0.2';

const parser = new Parser();

// ─── Safe expression evaluator (no eval) ───────────────────────────────────
const evaluateCondition = (conditionString, contextData) => {
  if (!conditionString) return true;
  try {
    const expr = parser.parse(conditionString);
    return expr.evaluate(contextData);
  } catch {
    return false;
  }
};

// ─── Pick a random phrase from an array ────────────────────────────────────
const pickPhrase = (phrases) => {
  if (!phrases || phrases.length === 0) return null;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// ─── Interpolate {placeholders} with contextData ───────────────────────────
const interpolate = (text, ctx) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => (ctx[key] !== undefined ? ctx[key] : `{${key}}`));
};

// ─── Build a flat rulebook map from VoiceRulebook records ──────────────────
const buildRulebookMap = (records) => {
  const map = {};
  for (const r of records) {
    map[r.step_id] = r;
  }
  return map;
};

// ─── Resolution engine ─────────────────────────────────────────────────────
const resolve = (ruleRecord, event, contextData) => {
  if (!ruleRecord) return null;

  const lang = contextData.languageCode || 'bg';

  // 1. If there's a field-level conditional and it doesn't pass → skip
  if (ruleRecord.trigger_type === 'step_enter') {
    // onenter phrases
    const phrases = ruleRecord.text_fallback
      ? [ruleRecord.text_fallback]
      : [];
    return {
      text: interpolate(pickPhrase(phrases), contextData),
      avatar_state: ruleRecord.avatar_state || 'talking',
      audio_url: ruleRecord.audio_url || null,
    };
  }

  if (ruleRecord.trigger_type === 'response_band') {
    return {
      text: interpolate(ruleRecord.text_fallback, contextData),
      avatar_state: ruleRecord.avatar_state || 'talking',
      audio_url: ruleRecord.audio_url || null,
    };
  }

  if (ruleRecord.trigger_type === 'validation_error') {
    return {
      text: interpolate(ruleRecord.text_fallback, contextData),
      avatar_state: 'concerned',
      audio_url: ruleRecord.audio_url || null,
    };
  }

  if (ruleRecord.trigger_type === 'completion') {
    return {
      text: interpolate(ruleRecord.text_fallback, contextData),
      avatar_state: ruleRecord.avatar_state || 'celebrating',
      audio_url: ruleRecord.audio_url || null,
    };
  }

  return null;
};

// ─── Match conditional phrases from the conditionals array in DB ───────────
const matchConditional = (conditionalRecords, contextData) => {
  for (const record of conditionalRecords) {
    if (!record.step_id || !record.text_fallback) continue;
    // step_id for conditionals encodes the condition string e.g. "cond:familyType == 'family'"
    if (record.step_id.startsWith('cond:')) {
      const condition = record.step_id.replace('cond:', '');
      if (evaluateCondition(condition, contextData)) {
        return {
          text: interpolate(record.text_fallback, contextData),
          avatar_state: record.avatar_state || 'talking',
          audio_url: record.audio_url || null,
        };
      }
    }
  }
  return null;
};

// ─── Determine next step with skip logic ───────────────────────────────────
const getNextStepId = (currentStepId, flowType) => {
  const id = parseInt(currentStepId);
  // Analysis skips step 2 (archived personal data step)
  if (flowType === 'analysis' && id === 1) return 3;
  return id + 1;
};

// ═══════════════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      flowType = 'planner',        // 'planner' | 'analysis'
      currentStepId,               // number or string step id
      event = 'step_enter',        // 'step_enter' | 'field_before' | 'field_after' | 'field_fallback' | 'validation_error' | 'completion' | 'conditional'
      fieldId = null,              // e.g. 'familytype', 'clientmonthlyincome'
      subEvent = null,             // e.g. 'missing' | 'invalid' | 'refused' | condition result key
      contextData = {},            // current journey context
      advanceStep = false,         // whether to compute nextStepId
    } = body;

    // ── Fetch matching rulebook records from VoiceRulebook entity ──────────
    // step_id format: "{flowType}_step_{stepId}" for step-level
    //                 "{flowType}_field_{fieldId}_{event}" for field-level
    //                 "cond:{conditionString}" for conditionals
    //                 "fallback_{key}" for global fallbacks

    const stepKey = `${flowType}_step_${currentStepId}`;
    const fieldKey = fieldId ? `${flowType}_field_${fieldId}_${event}` : null;
    const fallbackKey = subEvent ? `fallback_${subEvent}` : null;
    const lang = contextData.languageCode || 'bg';

    // Batch fetch: VoiceRulebook + ResponseBandDefinition + ResponseLogicDefinition for full rulebook evaluation
    const [stepRecords, fieldRecords, conditionalRecords, fallbackRecords, responseBands, responseLogics] = await Promise.all([
      base44.asServiceRole.entities.VoiceRulebook.filter({ step_id: stepKey, language_code: lang }),
      fieldKey ? base44.asServiceRole.entities.VoiceRulebook.filter({ step_id: fieldKey, language_code: lang }) : Promise.resolve([]),
      base44.asServiceRole.entities.VoiceRulebook.filter({ trigger_type: 'response_band', language_code: lang }),
      fallbackKey ? base44.asServiceRole.entities.VoiceRulebook.filter({ step_id: fallbackKey, language_code: lang }) : Promise.resolve([]),
      base44.asServiceRole.entities.ResponseBandDefinition.filter({ language_code: lang, is_active: true }, 'priority', 50),
      base44.asServiceRole.entities.ResponseLogicDefinition.filter({ language_code: lang, is_active: true }),
    ]);

    let result = null;

    // ── Resolution order (mirrors engine_behavior.resolutionOrder) ─────────
    // 1. Field-level event (before / after / fallback)
    if (fieldRecords.length > 0) {
      result = resolve(fieldRecords[0], event, contextData);
    }

    // 2. Conditional match
    if (!result) {
      result = matchConditional(conditionalRecords, contextData);
    }

    // 3. Step onenter
    if (!result && stepRecords.length > 0) {
      result = resolve(stepRecords[0], event, contextData);
    }

    // 3b. ResponseLogicDefinition evaluation (DB-driven metrics + bands)
    if (!result && responseLogics.length > 0 && Object.keys(contextData).length > 0) {
      const sortedLogics = [...responseLogics].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
      for (const logic of sortedLogics) {
        // Check if all depends_on_fields are present in contextData
        const hasAllFields = (logic.depends_on_fields || []).every(f => contextData[f] !== undefined);
        if (!hasAllFields) continue;

        // Compute the output metric using formula
        let metricValue = null;
        if (logic.formula) {
          try {
            const expr = parser.parse(logic.formula);
            metricValue = expr.evaluate(contextData);
          } catch { /* skip invalid formulas */ }
        }
        if (metricValue === null) continue;

        // Evaluate response_bands in priority order
        const bands = (logic.response_bands || []).sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
        for (const band of bands) {
          if (!band.expression) continue;
          try {
            const expr = parser.parse(band.expression);
            const matched = expr.evaluate({ [logic.output_metric_name]: metricValue });
            if (matched) {
              result = {
                text: interpolate(band.text_asset_key || band.band_id, contextData),
                avatar_state: band.avatar_state || 'talking',
                audio_url: null,
                matched_band_id: band.band_id,
                output_metric_name: logic.output_metric_name,
                output_metric_value: metricValue,
              };
              break;
            }
          } catch { /* skip invalid expressions */ }
        }
        if (result) break;
      }
    }

    // 3c. ResponseBandDefinition dynamic evaluation (legacy band format)
    if (!result && responseBands.length > 0 && Object.keys(contextData).length > 0) {
      const sorted = [...responseBands].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
      for (const band of sorted) {
        if (!band.expression) continue;
        try {
          const expr = parser.parse(band.expression);
          const matched = expr.evaluate(contextData);
          if (matched) {
            result = {
              text: interpolate(band.ui_message || band.recommendation_text || band.band_label, contextData),
              avatar_state: band.avatar_state || 'talking',
              audio_url: null,
              matched_band_id: band.band_id,
              band_severity: band.severity,
              triggers_graceful_stop: band.triggers_graceful_stop || false,
              plan_flag: band.plan_flag || null,
            };
            break;
          }
        } catch { /* skip invalid expressions */ }
      }
    }

    // 4. Fallback
    if (!result && fallbackRecords.length > 0) {
      result = {
        text: interpolate(fallbackRecords[0].text_fallback, contextData),
        avatar_state: fallbackRecords[0].avatar_state || 'concerned',
        audio_url: fallbackRecords[0].audio_url || null,
      };
    }

    // 5. Hard default
    if (!result) {
      result = {
        text: contextData.languageCode === 'en'
          ? 'Please continue filling in the form.'
          : 'Моля, продължете с попълването на формата.',
        avatar_state: 'idle',
        audio_url: null,
      };
    }

    // ── Compute next step if requested ─────────────────────────────────────
    const nextStepId = advanceStep ? getNextStepId(currentStepId, flowType) : null;

    // ── TTS: always generate speech from resolved text ──────────────────────

    if (result.text) {
      try {
        const ttsResult = await base44.integrations.Core.GenerateSpeech({
          text: result.text,
          voice: lang === 'bg' ? 'storm' : 'river',
          language_code: lang,
        });
        result.audio_url = ttsResult.url;
      } catch {
        result.audio_url = null;
      }
    }

    return Response.json({
      ...result,
      currentStepId,
      nextStepId,
      flowType,
      resolved: true,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});