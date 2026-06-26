import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ShieldCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

/**
 * ConsentCaptureFlow
 *
 * Props:
 *   journeyId   — required
 *   userId      — required
 *   language    — 'bg' | 'en' (default 'bg')
 *   onComplete  — callback(consentRecordIds: string[]) when all mandatory consents given
 *   onSkip      — optional: show skip button for non-mandatory-only flows
 */
export default function ConsentCaptureFlow({ journeyId, userId, language = 'bg', onComplete, onSkip }) {
  const [templates, setTemplates]   = useState([]);
  const [existing, setExisting]     = useState({}); // consent_key -> ConsentRecord
  const [expanded, setExpanded]     = useState({});
  const [checked, setChecked]       = useState({});
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { loadData(); }, [journeyId, userId, language]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tmplData, recordData] = await Promise.all([
        base44.entities.ConsentTemplate.filter({ language_code: language, is_active: true }),
        journeyId ? base44.entities.ConsentRecord.filter({ journey_id: journeyId }) : [],
      ]);

      // Sort: mandatory first
      const sorted = [...tmplData].sort((a, b) => (b.is_mandatory ? 1 : 0) - (a.is_mandatory ? 1 : 0));
      setTemplates(sorted);

      // Map existing active records
      const existingMap = {};
      recordData.forEach(r => { if (r.is_active) existingMap[r.consent_key] = r; });
      setExisting(existingMap);

      // Pre-check already-given consents
      const initial = {};
      sorted.forEach(t => { initial[t.consent_key] = !!existingMap[t.consent_key]; });
      setChecked(initial);

    } catch (e) {
      setError('Грешка при зареждане на съгласия.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const mandatoryKeys  = templates.filter(t => t.is_mandatory).map(t => t.consent_key);
  const allMandatoryOk = mandatoryKeys.every(k => checked[k]);

  const handleSubmit = async () => {
    if (!allMandatoryOk) return;
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const newRecordIds = [];

      for (const t of templates) {
        const wasGiven  = !!existing[t.consent_key];
        const isChecked = !!checked[t.consent_key];

        if (isChecked && !wasGiven) {
          // Create new consent record
          const rec = await base44.entities.ConsentRecord.create({
            user_id:          userId,
            journey_id:       journeyId,
            consent_key:      t.consent_key,
            consent_version:  t.version,
            language_code:    language,
            given_at:         now,
            source:           'web_app',
            is_active:        true,
          });
          newRecordIds.push(rec.id);
        } else if (!isChecked && wasGiven) {
          // Withdraw optional consent that was previously given
          if (!t.is_mandatory) {
            await base44.entities.ConsentRecord.update(existing[t.consent_key].id, {
              is_active:    false,
              withdrawn_at: now,
            });
          }
        }
      }

      if (onComplete) onComplete(newRecordIds);
    } catch (e) {
      setError('Грешка при запис на съгласията. Моля, опитайте отново.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">Няма активни шаблони за съгласие.</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Съгласия за обработка на данни</h3>
          <p className="text-xs text-slate-500">Необходими съгласия съгласно GDPR и КЗ</p>
        </div>
      </div>

      {/* Consent items */}
      {templates.map(t => {
        const isGiven    = !!existing[t.consent_key];
        const isExpanded = !!expanded[t.consent_key];
        const isCheckedNow = !!checked[t.consent_key];

        return (
          <div
            key={t.consent_key}
            className={`rounded-xl border transition-colors ${
              isCheckedNow
                ? 'border-blue-200 bg-blue-50/50'
                : t.is_mandatory
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-slate-200 bg-white'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={t.consent_key}
                  checked={isCheckedNow}
                  onCheckedChange={() => toggle(t.consent_key)}
                  disabled={isGiven && t.is_mandatory}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={t.consent_key}
                    className="font-medium text-sm text-slate-800 cursor-pointer leading-snug"
                  >
                    {t.title}
                    {t.is_mandatory && (
                      <span className="ml-2 text-xs text-red-500 font-normal">* задължително</span>
                    )}
                    {isGiven && (
                      <span className="ml-2 text-xs text-green-600 font-normal">✓ дадено</span>
                    )}
                  </label>
                  {t.purpose && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.purpose}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleExpand(t.consent_key)}
                  className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-0.5"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded full text */}
              {isExpanded && (
                <div className="mt-3 ml-7 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {t.full_text}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Mandatory warning */}
      {!allMandatoryOk && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Задължителните съгласия (маркирани с *) са необходими за продължаване.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button
          onClick={handleSubmit}
          disabled={!allMandatoryOk || saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
          Потвърди съгласията
        </Button>
        {onSkip && (
          <Button variant="outline" onClick={onSkip} className="rounded-xl border-slate-300 text-slate-600">
            По-късно
          </Button>
        )}
      </div>
    </div>
  );
}