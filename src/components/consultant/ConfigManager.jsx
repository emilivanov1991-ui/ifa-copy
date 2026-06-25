import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  BookOpen, Plus, Edit, Trash2, Save, RefreshCw, CheckCircle2,
  AlertTriangle, ChevronRight, Code2, FileJson, Volume2, Layers,
  Mic, MessageSquare, GitBranch, Shield, Database
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Rulebook Manager ────────────────────────────────────────────────────────
function RulebookManager() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    base44.entities.JsonRulebookVersion.list('-created_date', 20)
      .then(setVersions).catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (v) => {
    setSelected(v);
    setJsonText(JSON.stringify(v.rulebook_json || {}, null, 2));
    setEditing(false);
    setJsonError('');
  };

  const validateJson = (text) => {
    try { JSON.parse(text); setJsonError(''); return true; }
    catch (e) { setJsonError(e.message); return false; }
  };

  const handleSave = async () => {
    if (!validateJson(jsonText)) return;
    const parsed = JSON.parse(jsonText);
    const data = { ...selected, rulebook_json: parsed, is_active: selected.is_active };
    await base44.entities.JsonRulebookVersion.update(selected.id, data);
    const updated = versions.map(v => v.id === selected.id ? { ...v, rulebook_json: parsed } : v);
    setVersions(updated);
    setSelected({ ...selected, rulebook_json: parsed });
    setEditing(false);
    toast.success('Rulebook запазен');
  };

  const handleCreate = async () => {
    const v = { version: `${Date.now()}`, ruleset_hash: '', valid_from: new Date().toISOString().split('T')[0], rulebook_json: {}, is_active: false };
    const created = await base44.entities.JsonRulebookVersion.create(v);
    setVersions(prev => [created, ...prev]);
    handleSelect(created);
    toast.success('Нова версия създадена');
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-700">Версии</h4>
          <Button size="sm" onClick={handleCreate}><Plus className="h-3.5 w-3.5 mr-1" />Нова</Button>
        </div>
        {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : versions.map(v => (
          <div key={v.id} onClick={() => handleSelect(v)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selected?.id === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">v{v.version}</span>
              <Badge variant={v.is_active ? 'default' : 'outline'} className={v.is_active ? 'bg-green-500 text-xs' : 'text-xs'}>
                {v.is_active ? 'Активна' : 'Draft'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">{v.valid_from}</p>
          </div>
        ))}
        {versions.length === 0 && !loading && (
          <p className="text-sm text-slate-400 text-center py-4">Няма версии</p>
        )}
      </div>

      <div className="md:col-span-2">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Rulebook v{selected.version}</h4>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => { setEditing(false); setJsonError(''); }}>Отказ</Button>
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="h-3.5 w-3.5 mr-1" />Запази</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setEditing(true)}><Edit className="h-3.5 w-3.5 mr-1" />Редактирай</Button>
                )}
              </div>
            </div>
            {jsonError && <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600"><AlertTriangle className="h-3.5 w-3.5 inline mr-1" />{jsonError}</div>}
            <textarea
              className={`w-full h-96 p-3 font-mono text-xs rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${editing ? 'bg-white border-blue-300' : 'bg-slate-50 border-slate-200'}`}
              value={jsonText}
              readOnly={!editing}
              onChange={e => { setJsonText(e.target.value); validateJson(e.target.value); }}
            />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center"><FileJson className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>Изберете версия</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Consent Templates Manager ───────────────────────────────────────────────
function ConsentTemplatesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    base44.entities.ConsentTemplate.list('-created_date', 50)
      .then(setTemplates).catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setForm({ title: '', purpose: '', language_code: 'bg', full_text: '', version: '1.0', valid_from: new Date().toISOString().split('T')[0] });
    setSelected(null);
    setIsOpen(true);
  };

  const openEdit = (t) => { setForm({ ...t }); setSelected(t); setIsOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.purpose) { toast.error('Попълнете заглавие и цел'); return; }
    if (selected) {
      await base44.entities.ConsentTemplate.update(selected.id, form);
      setTemplates(prev => prev.map(t => t.id === selected.id ? { ...t, ...form } : t));
    } else {
      const created = await base44.entities.ConsentTemplate.create(form);
      setTemplates(prev => [created, ...prev]);
    }
    setIsOpen(false);
    toast.success('Шаблон запазен');
  };

  const handleDelete = async (id) => {
    await base44.entities.ConsentTemplate.delete(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Шаблон изтрит');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{templates.length} шаблона</p>
        <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />Нов шаблон</Button>
      </div>
      {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : (
        <div className="space-y-2">
          {templates.map(t => (
            <div key={t.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{t.title}</span>
                  <Badge variant="outline" className="text-xs">{t.language_code?.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-xs">v{t.version}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{t.purpose}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Няма шаблони</p>}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected ? 'Редактирай шаблон' : 'Нов шаблон'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Заглавие</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-1"><Label>Цел</Label><Input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>Език</Label>
                  <Select value={form.language_code} onValueChange={v => setForm({ ...form, language_code: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="bg">BG</SelectItem><SelectItem value="en">EN</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Версия</Label><Input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} /></div>
                <div className="space-y-1"><Label>Валиден от</Label><Input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Пълен текст</Label><Textarea value={form.full_text} onChange={e => setForm({ ...form, full_text: e.target.value })} rows={6} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Отказ</Button>
                <Button onClick={handleSave} className="bg-blue-600"><Save className="h-3.5 w-3.5 mr-1" />Запази</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Response Band Library ───────────────────────────────────────────────────
function ResponseBandLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    base44.entities.ResponseBandDefinition.list('-created_date', 100)
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setForm({ band_id: '', metric_name: '', expression: '', language_code: 'bg', bg_text: '', en_text: '', avatar_state: 'talking', priority: 1 });
    setSelected(null); setIsOpen(true);
  };

  const openEdit = (item) => { setForm({ ...item }); setSelected(item); setIsOpen(true); };

  const handleSave = async () => {
    if (!form.band_id || !form.metric_name) { toast.error('Попълнете Band ID и метрика'); return; }
    if (selected) {
      await base44.entities.ResponseBandDefinition.update(selected.id, form);
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
    } else {
      const created = await base44.entities.ResponseBandDefinition.create(form);
      setItems(prev => [created, ...prev]);
    }
    setIsOpen(false);
    toast.success('Band запазен');
  };

  const handleDelete = async (id) => {
    await base44.entities.ResponseBandDefinition.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Band изтрит');
  };

  const avatarStates = ['idle', 'talking', 'listening', 'thinking', 'celebrating', 'concerned'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} response bands</p>
        <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />Нов Band</Button>
      </div>
      {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{item.band_id}</span>
                  <span className="text-sm text-slate-600">{item.metric_name}</span>
                  <Badge variant="outline" className="text-xs">{item.avatar_state}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{item.expression}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Няма response bands</p>}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{selected ? 'Редактирай Band' : 'Нов Response Band'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Band ID</Label><Input placeholder="reserve_low" value={form.band_id} onChange={e => setForm({ ...form, band_id: e.target.value })} /></div>
                <div className="space-y-1"><Label>Метрика</Label><Input placeholder="reserve_months" value={form.metric_name} onChange={e => setForm({ ...form, metric_name: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Израз (expression)</Label><Input placeholder="reserve_months < 1" className="font-mono" value={form.expression} onChange={e => setForm({ ...form, expression: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Avatar State</Label>
                  <Select value={form.avatar_state} onValueChange={v => setForm({ ...form, avatar_state: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{avatarStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Приоритет</Label><Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Текст (BG)</Label><Textarea rows={2} value={form.bg_text} onChange={e => setForm({ ...form, bg_text: e.target.value })} /></div>
              <div className="space-y-1"><Label>Текст (EN)</Label><Textarea rows={2} value={form.en_text} onChange={e => setForm({ ...form, en_text: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Отказ</Button>
                <Button onClick={handleSave} className="bg-blue-600"><Save className="h-3.5 w-3.5 mr-1" />Запази</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Localized Text Assets ───────────────────────────────────────────────────
function LocalizedTextAssets() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('all');
  const [form, setForm] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.LocalizedTextAsset.list('-created_date', 200)
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    (lang === 'all' || i.language_code === lang) &&
    (i.asset_key?.toLowerCase().includes(search.toLowerCase()) || i.text_content?.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setForm({ asset_key: '', language_code: 'bg', text_content: '', context: '' }); setSelected(null); setIsOpen(true); };
  const openEdit = (item) => { setForm({ ...item }); setSelected(item); setIsOpen(true); };

  const handleSave = async () => {
    if (!form.asset_key || !form.text_content) { toast.error('Попълнете ключ и текст'); return; }
    if (selected) {
      await base44.entities.LocalizedTextAsset.update(selected.id, form);
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
    } else {
      const created = await base44.entities.LocalizedTextAsset.create(form);
      setItems(prev => [created, ...prev]);
    }
    setIsOpen(false);
    toast.success('Текст запазен');
  };

  const handleDelete = async (id) => {
    await base44.entities.LocalizedTextAsset.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Изтрит');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <Input placeholder="Търси ключ или текст..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="bg">BG</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />Нов</Button>
      </div>
      {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map(item => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item.asset_key}</span>
                  <Badge variant="outline" className="text-xs">{item.language_code?.toUpperCase()}</Badge>
                  {item.context && <span className="text-xs text-slate-400">{item.context}</span>}
                </div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.text_content}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Няма резултати</p>}
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected ? 'Редактирай текст' : 'Нов текст'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Asset Key</Label><Input placeholder="btn.confirm.bg" value={form.asset_key} onChange={e => setForm({ ...form, asset_key: e.target.value })} /></div>
                <div className="space-y-1"><Label>Език</Label>
                  <Select value={form.language_code} onValueChange={v => setForm({ ...form, language_code: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="bg">BG</SelectItem><SelectItem value="en">EN</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Контекст</Label><Input placeholder="Бутон за потвърждение" value={form.context} onChange={e => setForm({ ...form, context: e.target.value })} /></div>
              <div className="space-y-1"><Label>Текст</Label><Textarea rows={4} value={form.text_content} onChange={e => setForm({ ...form, text_content: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Отказ</Button>
                <Button onClick={handleSave} className="bg-blue-600"><Save className="h-3.5 w-3.5 mr-1" />Запази</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Voice Rulebook Manager ──────────────────────────────────────────────────
function VoiceRulebookManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.VoiceRulebook.list('-created_date', 100)
      .then(setItems).catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.step_id?.toLowerCase().includes(search.toLowerCase()) || i.text_fallback?.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setForm({ step_id: '', trigger_type: 'step_enter', language_code: 'bg', text_fallback: '', avatar_state: 'talking', duration_seconds: 5, is_active: true });
    setSelected(null); setIsOpen(true);
  };
  const openEdit = (item) => { setForm({ ...item }); setSelected(item); setIsOpen(true); };

  const handleSave = async () => {
    if (!form.step_id || !form.text_fallback) { toast.error('Попълнете Step ID и текст'); return; }
    if (selected) {
      await base44.entities.VoiceRulebook.update(selected.id, form);
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
    } else {
      const created = await base44.entities.VoiceRulebook.create(form);
      setItems(prev => [created, ...prev]);
    }
    setIsOpen(false);
    toast.success('Voice entry запазен');
  };

  const handleDelete = async (id) => {
    await base44.entities.VoiceRulebook.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const triggerTypes = ['step_enter', 'response_band', 'validation_error', 'completion'];
  const avatarStates = ['idle', 'talking', 'listening', 'thinking', 'celebrating', 'concerned', 'live_presenter', 'idle_listening', 'loading', 'error'];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 justify-between">
        <Input placeholder="Търси step_id..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />Нов</Button>
      </div>
      {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map(item => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded">{item.step_id}</span>
                  <Badge variant="outline" className="text-xs">{item.trigger_type}</Badge>
                  <Badge variant="outline" className="text-xs">{item.avatar_state}</Badge>
                  <Badge variant="outline" className="text-xs">{item.language_code?.toUpperCase()}</Badge>
                  {!item.is_active && <Badge className="text-xs bg-slate-400">Неактивен</Badge>}
                </div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-1">{item.text_fallback}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Няма записи</p>}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{selected ? 'Редактирай Voice Entry' : 'Нов Voice Entry'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Step ID</Label><Input placeholder="planner_step_1" value={form.step_id} onChange={e => setForm({ ...form, step_id: e.target.value })} /></div>
                <div className="space-y-1"><Label>Trigger Type</Label>
                  <Select value={form.trigger_type} onValueChange={v => setForm({ ...form, trigger_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{triggerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Език</Label>
                  <Select value={form.language_code} onValueChange={v => setForm({ ...form, language_code: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="bg">BG</SelectItem><SelectItem value="en">EN</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Avatar State</Label>
                  <Select value={form.avatar_state} onValueChange={v => setForm({ ...form, avatar_state: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{avatarStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Текст (fallback)</Label><Textarea rows={3} value={form.text_fallback} onChange={e => setForm({ ...form, text_fallback: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Продължителност (сек)</Label><Input type="number" value={form.duration_seconds} onChange={e => setForm({ ...form, duration_seconds: +e.target.value })} /></div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                    <span className="text-sm">Активен</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Отказ</Button>
                <Button onClick={handleSave} className="bg-blue-600"><Save className="h-3.5 w-3.5 mr-1" />Запази</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Follow Up Tasks Manager ─────────────────────────────────────────────────
function FollowUpTasksManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    const query = statusFilter === 'all' ? {} : { status: statusFilter };
    base44.entities.FollowUpTask.filter(query, '-created_date', 50)
      .then(setTasks).catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await base44.entities.FollowUpTask.update(id, { status });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast.success('Статус обновен');
  };

  const priorityColors = { low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };
  const statusColors = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-violet-100 text-violet-700', done: 'bg-green-100 text-green-700', cancelled: 'bg-slate-100 text-slate-500' };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'open', 'in_progress', 'done'].map(s => (
          <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
            className={statusFilter === s ? 'bg-blue-600' : ''}
            onClick={() => { setStatusFilter(s); setLoading(true); }}>
            {s === 'all' ? 'Всички' : s === 'open' ? 'Отворени' : s === 'in_progress' ? 'В процес' : 'Завършени'}
          </Button>
        ))}
      </div>
      {loading ? <div className="text-sm text-slate-400">Зареждане...</div> : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {tasks.map(task => (
            <div key={task.id} className="p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>{task.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status] || statusColors.open}`}>{task.status}</span>
                    <Badge variant="outline" className="text-xs">{task.assigned_queue}</Badge>
                  </div>
                  <p className="font-medium text-sm mt-1">{task.reason?.replace(/_/g, ' ')}</p>
                  {task.reason_detail && <p className="text-xs text-slate-500">{task.reason_detail}</p>}
                  {task.client_name && <p className="text-xs text-slate-500 mt-1">Клиент: {task.client_name} {task.client_email && `· ${task.client_email}`}</p>}
                </div>
                <div className="flex gap-1">
                  {task.status === 'open' && <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, 'in_progress')}>В процес</Button>}
                  {task.status === 'in_progress' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(task.id, 'done')}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Завърши</Button>}
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Няма задачи</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main ConfigManager ──────────────────────────────────────────────────────
const tabs = [
  { id: 'rulebook', label: 'JSON Rulebook', icon: FileJson },
  { id: 'voice', label: 'Voice Prompts', icon: Mic },
  { id: 'bands', label: 'Response Bands', icon: GitBranch },
  { id: 'texts', label: 'Локализирани текстове', icon: MessageSquare },
  { id: 'consents', label: 'Consent Templates', icon: Shield },
  { id: 'followup', label: 'Follow-Up Tasks', icon: Database },
];

export default function ConfigManager() {
  const [activeTab, setActiveTab] = useState('rulebook');
  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || BookOpen;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Config Manager</h2>
          <p className="text-sm text-slate-500">Управление на правила, текстове, consent и voice prompts</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          {activeTab === 'rulebook' && <RulebookManager />}
          {activeTab === 'voice' && <VoiceRulebookManager />}
          {activeTab === 'bands' && <ResponseBandLibrary />}
          {activeTab === 'texts' && <LocalizedTextAssets />}
          {activeTab === 'consents' && <ConsentTemplatesManager />}
          {activeTab === 'followup' && <FollowUpTasksManager />}
        </CardContent>
      </Card>
    </div>
  );
}