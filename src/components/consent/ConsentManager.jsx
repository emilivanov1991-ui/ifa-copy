import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ShieldCheck, Plus, Edit2, Trash2, Loader2, Eye, EyeOff,
  CheckCircle2, XCircle, Search, Users, FileText
} from 'lucide-react';

// ─── Template Editor ──────────────────────────────────────────────────────────

function TemplateEditor({ template, onSave, onCancel }) {
  const [form, setForm] = useState(template || {
    consent_key: '', version: '1.0', language_code: 'bg', title: '',
    full_text: '', purpose: '', is_mandatory: true, is_active: true,
    valid_from: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.consent_key || !form.title || !form.full_text) return;
    setSaving(true);
    try {
      if (template?.id) {
        await base44.entities.ConsentTemplate.update(template.id, form);
      } else {
        await base44.entities.ConsentTemplate.create(form);
      }
      onSave();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ключ (consent_key) *</label>
          <input className={inputCls} value={form.consent_key} onChange={e => set('consent_key', e.target.value)} placeholder="gdpr_analysis" disabled={!!template?.id} />
        </div>
        <div>
          <label className={labelCls}>Версия</label>
          <input className={inputCls} value={form.version} onChange={e => set('version', e.target.value)} placeholder="1.0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Език</label>
          <select className={inputCls} value={form.language_code} onChange={e => set('language_code', e.target.value)}>
            <option value="bg">Български</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Валиден от</label>
          <input type="date" className={inputCls} value={form.valid_from || ''} onChange={e => set('valid_from', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Заглавие *</label>
        <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Съгласие за обработка на лични данни" />
      </div>

      <div>
        <label className={labelCls}>Кратко описание (purpose)</label>
        <input className={inputCls} value={form.purpose || ''} onChange={e => set('purpose', e.target.value)} placeholder="За целите на финансовия анализ и посредничество" />
      </div>

      <div>
        <label className={labelCls}>Пълен текст *</label>
        <textarea className={`${inputCls} min-h-[120px] resize-y`} value={form.full_text} onChange={e => set('full_text', e.target.value)} placeholder="Пълният юридически текст на съгласието..." />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_mandatory} onChange={e => set('is_mandatory', e.target.checked)} className="rounded" />
          <span className="text-sm text-slate-700">Задължително</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
          <span className="text-sm text-slate-700">Активно</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
          {template?.id ? 'Запази' : 'Създай'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="rounded-lg text-sm border-slate-300">Откажи</Button>
      </div>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null); // null | 'new' | template object
  const [expandedText, setExpandedText] = useState({});

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ConsentTemplate.list('-created_date', 50);
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (t) => {
    await base44.entities.ConsentTemplate.update(t.id, { is_active: !t.is_active });
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
  };

  const remove = async (t) => {
    if (!window.confirm(`Изтрий шаблон "${t.title}"?`)) return;
    await base44.entities.ConsentTemplate.delete(t.id);
    setTemplates(prev => prev.filter(x => x.id !== t.id));
  };

  if (editing) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-4">
          {editing === 'new' ? 'Нов шаблон' : `Редактиране: ${editing.title}`}
        </h4>
        <TemplateEditor
          template={editing === 'new' ? null : editing}
          onSave={() => { setEditing(null); load(); }}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">{templates.length} шаблона</p>
        <Button size="sm" onClick={() => setEditing('new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />Нов шаблон
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          Няма шаблони. Създайте първия шаблон.
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className={`p-3 rounded-xl border ${t.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-medium text-sm text-slate-800">{t.title}</span>
                    <Badge className={`text-xs px-1.5 ${t.is_mandatory ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.is_mandatory ? 'Задължително' : 'По избор'}
                    </Badge>
                    <Badge className="text-xs px-1.5 bg-blue-100 text-blue-600">v{t.version}</Badge>
                    <Badge className="text-xs px-1.5 bg-slate-100 text-slate-500">{t.language_code.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{t.consent_key}</p>
                  {t.purpose && <p className="text-xs text-slate-500 mt-0.5 truncate">{t.purpose}</p>}

                  {expandedText[t.id] && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-200">
                      {t.full_text}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setExpandedText(p => ({ ...p, [t.id]: !p[t.id] }))} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" title="Виж текст">
                    {expandedText[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setEditing(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Редактирай">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleActive(t)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50" title={t.is_active ? 'Деактивирай' : 'Активирай'}>
                    {t.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => remove(t)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Изтрий">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Records Tab ──────────────────────────────────────────────────────────────

function RecordsTab() {
  const [records, setRecords]     = useState([]);
  const [templates, setTemplates] = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | withdrawn

  useEffect(() => {
    (async () => {
      const [recs, tmpls] = await Promise.all([
        base44.entities.ConsentRecord.list('-given_at', 100),
        base44.entities.ConsentTemplate.list(),
      ]);
      setRecords(recs);
      const m = {}; tmpls.forEach(t => { m[t.consent_key] = t; });
      setTemplates(m);
      setLoading(false);
    })();
  }, []);

  const filtered = records.filter(r => {
    if (filterStatus === 'active' && !r.is_active) return false;
    if (filterStatus === 'withdrawn' && r.is_active) return false;
    if (search) {
      const tmpl = templates[r.consent_key];
      const haystack = `${r.user_id} ${r.consent_key} ${tmpl?.title || ''}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 border border-slate-200 rounded-lg px-3 h-8 bg-white">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            className="flex-1 text-sm outline-none placeholder:text-slate-400"
            placeholder="Търси по user_id или ключ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-2 h-8 text-sm bg-white text-slate-700"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">Всички</option>
          <option value="active">Активни</option>
          <option value="withdrawn">Оттеглени</option>
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-3">{filtered.length} записа</p>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Няма записи.</div>
      ) : (
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map(r => {
            const tmpl = templates[r.consent_key];
            return (
              <div key={r.id} className={`p-3 rounded-xl border text-xs ${r.is_active ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.is_active
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <span className="font-medium text-slate-700">{tmpl?.title || r.consent_key}</span>
                      <span className="ml-2 text-slate-400 font-mono">{r.consent_key}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-500">
                    <span>v{r.consent_version}</span>
                    <span>·</span>
                    <span>{r.given_at ? new Date(r.given_at).toLocaleDateString('bg-BG') : '—'}</span>
                    {!r.is_active && r.withdrawn_at && (
                      <span className="text-red-500">→ оттеглено {new Date(r.withdrawn_at).toLocaleDateString('bg-BG')}</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-slate-400 font-mono truncate">user: {r.user_id?.slice(0, 20)}…</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ConsentManager ──────────────────────────────────────────────────────

export default function ConsentManager() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-white" />
        <div>
          <h3 className="text-white font-semibold text-sm">Управление на съгласия (GDPR)</h3>
          <p className="text-blue-200 text-xs mt-0.5">Шаблони за съгласия и GDPR записи</p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="templates">
          <TabsList className="bg-slate-100 rounded-xl p-1 mb-4 w-full">
            <TabsTrigger value="templates" className="flex-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-3.5 h-3.5 mr-1.5" />Шаблони
            </TabsTrigger>
            <TabsTrigger value="records" className="flex-1 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-3.5 h-3.5 mr-1.5" />Записи
            </TabsTrigger>
          </TabsList>
          <TabsContent value="templates"><TemplatesTab /></TabsContent>
          <TabsContent value="records"><RecordsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}