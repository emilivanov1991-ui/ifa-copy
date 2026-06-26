import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldOff, ShieldCheck, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/**
 * ConsentWithdrawalFlow
 *
 * Shows the user all their active consents and lets them withdraw optional ones.
 *
 * Props:
 *   userId      — required
 *   journeyId   — optional (filter to specific journey)
 *   onDone      — callback after withdrawal
 */
export default function ConsentWithdrawalFlow({ userId, journeyId, onDone }) {
  const [records, setRecords]     = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading]     = useState(true);
  const [withdrawing, setWithdrawing] = useState({});
  const [done, setDone]           = useState({});
  const [error, setError]         = useState(null);

  useEffect(() => { loadData(); }, [userId, journeyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filter = journeyId
        ? { user_id: userId, journey_id: journeyId, is_active: true }
        : { user_id: userId, is_active: true };

      const [recs, tmpls] = await Promise.all([
        base44.entities.ConsentRecord.filter(filter),
        base44.entities.ConsentTemplate.filter({ is_active: true }),
      ]);

      setRecords(recs);
      const tmplMap = {};
      tmpls.forEach(t => { tmplMap[t.consent_key] = t; });
      setTemplates(tmplMap);
    } catch (e) {
      setError('Грешка при зареждане.');
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (record) => {
    const tmpl = templates[record.consent_key];
    if (tmpl?.is_mandatory) return; // cannot withdraw mandatory

    setWithdrawing(prev => ({ ...prev, [record.id]: true }));
    setError(null);
    try {
      await base44.entities.ConsentRecord.update(record.id, {
        is_active:    false,
        withdrawn_at: new Date().toISOString(),
      });
      setDone(prev => ({ ...prev, [record.id]: true }));
      setRecords(prev => prev.map(r => r.id === record.id ? { ...r, is_active: false } : r));
    } catch (e) {
      setError('Грешка при оттегляне на съгласие.');
    } finally {
      setWithdrawing(prev => ({ ...prev, [record.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      </div>
    );
  }

  const activeRecords   = records.filter(r => r.is_active);
  const withdrawnCount  = Object.keys(done).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <ShieldOff className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Управление на съгласия</h3>
          <p className="text-xs text-slate-500">Преглед и оттегляне на дадени съгласия</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Задължителните съгласия не могат да бъдат оттеглени, докато договорът е активен.
          Оттеглянето на незадължителни съгласия е в сила от момента на потвърждение.
        </span>
      </div>

      {activeRecords.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Няма активни съгласия за показване.
        </div>
      ) : (
        <div className="space-y-2">
          {activeRecords.map(record => {
            const tmpl        = templates[record.consent_key] || {};
            const isMandatory = tmpl.is_mandatory;
            const isWithdrawn = done[record.id];
            const isLoading   = withdrawing[record.id];

            return (
              <div
                key={record.id}
                className={`p-4 rounded-xl border ${
                  isWithdrawn ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {isWithdrawn
                      ? <ShieldOff className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      : <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {tmpl.title || record.consent_key}
                      </p>
                      {tmpl.purpose && (
                        <p className="text-xs text-slate-500 mt-0.5">{tmpl.purpose}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge className={`text-xs px-2 ${isMandatory ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isMandatory ? 'Задължително' : 'По избор'}
                        </Badge>
                        <Badge className="text-xs px-2 bg-green-100 text-green-700">
                          Дадено {record.given_at ? new Date(record.given_at).toLocaleDateString('bg-BG') : ''}
                        </Badge>
                        <Badge className="text-xs px-2 bg-slate-100 text-slate-500">
                          v{record.consent_version}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isWithdrawn ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Оттеглено
                      </span>
                    ) : isMandatory ? (
                      <span className="text-xs text-slate-400 italic">Не може да се оттегли</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => withdraw(record)}
                        disabled={isLoading}
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-7 px-3 rounded-lg"
                      >
                        {isLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <><ShieldOff className="w-3 h-3 mr-1" />Оттегли</>
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {withdrawnCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {withdrawnCount} съгласие(я) оттеглено успешно.
        </div>
      )}

      {onDone && (
        <Button onClick={onDone} variant="outline" className="w-full rounded-xl border-slate-300">
          Готово
        </Button>
      )}
    </div>
  );
}