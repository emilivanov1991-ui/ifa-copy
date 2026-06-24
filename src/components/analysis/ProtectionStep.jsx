import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Shield, Wallet, Building2, Car, Plus, Download, User, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import BulgarianDateInput from '@/components/ui/BulgarianDateInput';
import CarProtectionFields from './CarProtectionFields';

const INSURANCE_COMPANIES = [
  { value: 'allianz', label: 'ЗД Алианц България' },
  { value: 'armeec', label: 'ЗД Армеец' },
  { value: 'bulins', label: 'ЗД Бул Инс' },
  { value: 'bulstrad', label: 'ЗД Булстрад Виена Иншурънс Груп' },
  { value: 'groupama', label: 'ЗД Групама' },
  { value: 'dzi', label: 'ЗД ДЗИ' },
  { value: 'generali', label: 'ЗД Дженерали Застраховане' },
  { value: 'dallbogg', label: 'ЗД ДаллБогг Живот и Здраве' },
  { value: 'euroins', label: 'ЗД Евроинс Иншурънс Груп' },
  { value: 'levins', label: 'ЗД Лев Инс' },
  { value: 'obb', label: 'ЗД ОББ' },
  { value: 'ozk', label: 'ЗД ОЗК Застраховане' },
  { value: 'uniqa', label: 'ЗД Уника' },
];

export default function ProtectionStep({ data, onChange, showErrors, plannerData, lang = 'bg' }) {
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);
  const t = (bg, en) => lang === 'en' ? en : bg;

  const clientName = plannerData?.client_first_name || 'Клиент';
  const partnerName = plannerData?.partner_first_name || 'Партньор';
  const includePartner = plannerData?.family_type === 'family' || data.include_partner;

  const hasAnyProperty = data.has_property_1 || false;
  const hasAnyCar = data.has_car_1 || false;
  const hasAnyAsset = hasAnyProperty || hasAnyCar;

  const importFromHousing = () => {
    if (data.current_housing === 'owned') {
      onChange('property_1_address', data.current_housing_address || data.client_address || '');
      onChange('property_1_rooms', data.current_housing_rooms || '');
      onChange('property_1_area', data.current_housing_area || '');
      onChange('property_1_value', data.current_housing_value || '');
      onChange('property_1_movable_value', data.current_housing_movable_value || '');
    }
  };

  const getExistingNames = () => {
    return [
      ...(data.referrals_no_own_home || []),
      ...(data.referrals_own_home_long || []),
      ...(data.birthday_family_names || []),
      ...(data.birthday_friends_names || []),
      ...(data.birthday_colleagues_names || []),
      ...(data.referrals_have_savings || []),
      ...(data.referrals_invest_regularly || []),
      ...(data.pension_referrals_abroad || []),
      ...(data.pension_referrals_high_income || []),
      ...(data.pension_referrals_entrepreneur || []),
      ...(data.pension_referrals_young || []),
      ...(data.children_referrals_has_kids || []),
      ...(data.children_referrals_recent_wedding || [])
    ].filter(n => n && n.trim());
  };

  const isDuplicateName = (name) => {
    if (!name || !name.trim()) return false;
    return getExistingNames().some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
  };

  const calculateLayoffCompensation = (g) => { if (!g) return 0; return Math.max(320, Math.min(1730, Math.round(g * 0.60))); };
  const calculateSickLeaveCompensation = (g) => { if (!g) return 0; return Math.max(320, Math.min(1730, Math.round(g * 0.60))); };
  const calculateMaternityYear1 = (g) => { if (!g) return 0; return Math.max(476, Math.min(1540, Math.round(g * 0.77))); };
  const maternityYear2 = 398;
  const calculateDeathCompensation = (g) => { if (!g) return 0; return Math.max(153, Math.min(511, Math.round(g * 0.22))); };
  const calculateDisabilityCompensation = (g) => { if (!g) return 0; return Math.max(343, Math.min(1730, Math.round(g * 0.49))); };

  const getMissingIncomeColor = (m, net) => {
    if (!m || m <= 0) return 'bg-slate-100';
    const r = net > 0 ? m / net : 0;
    if (r >= 0.7) return 'bg-red-200';
    if (r >= 0.5) return 'bg-red-100';
    if (r >= 0.3) return 'bg-amber-100';
    return 'bg-yellow-50';
  };

  const clientGrossIncome = data.client_gross_income_pension || 0;
  const partnerGrossIncome = data.partner_gross_income_pension || 0;
  const clientNetIncome = data.client_monthly_net_income || 0;
  const partnerNetIncome = data.partner_monthly_net_income || 0;

  // Reusable property insurance block
  const PropertyInsuranceBlock = ({ prefix }) => {
    const hasIns = data[`${prefix}_has_insurance`] ?? false;
    return (
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !hasIns ? "text-red-600" : "text-slate-400")}>не</span>
            <button type="button" onClick={() => onChange(`${prefix}_has_insurance`, !hasIns)}
              className={cn("w-12 h-6 rounded-full transition-colors relative", hasIns ? "bg-green-500" : "bg-red-500")}>
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", hasIns ? "left-6" : "left-0.5")} />
            </button>
            <span className={cn("text-sm font-medium", hasIns ? "text-green-600" : "text-slate-400")}>да</span>
          </div>
        </div>
        {hasIns && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2" data-invalid={hasIns && isFieldInvalid(data[`${prefix}_insurer`]) ? "true" : undefined}>
              <Label className="text-sm">Застраховател <span className="text-red-500">*</span></Label>
              <Combobox options={INSURANCE_COMPANIES} value={data[`${prefix}_insurer`] || ''}
                onValueChange={v => onChange(`${prefix}_insurer`, v)}
                placeholder="Търси застраховател..." searchPlaceholder="Търси..." emptyText="Няма намерен застраховател."
                triggerClassName={`rounded-lg ${hasIns && isFieldInvalid(data[`${prefix}_insurer`]) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <div className="space-y-2" data-invalid={hasIns && isFieldInvalid(data[`${prefix}_insurance_expiry`]) ? "true" : undefined}>
              <Label className="text-sm">Срок на полицата (дд.мм.гггг) <span className="text-red-500">*</span></Label>
              <BulgarianDateInput value={data[`${prefix}_insurance_expiry`] || ''}
                onChange={v => onChange(`${prefix}_insurance_expiry`, v)}
                className={`rounded-lg ${hasIns && isFieldInvalid(data[`${prefix}_insurance_expiry`]) ? 'border-red-500 bg-red-50' : ''}`} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Месечна сума по застраховката (€)</Label>
              <Input type="number" min="0" value={data[`${prefix}_insurance_monthly`] ?? ''}
                onChange={e => onChange(`${prefix}_insurance_monthly`, e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="rounded-lg w-40" placeholder="0" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reusable risk row for income protection
  const RiskRow = ({ label, field, grossIncome, netIncome, calcFn, extraContent }) => {
    const active = data[field] ?? false;
    const compensation = calcFn(grossIncome);
    const missing = Math.max(0, netIncome - compensation);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">{label}</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !active ? "text-green-600" : "text-slate-400")}>не</span>
            <button type="button" onClick={() => onChange(field, !active)}
              className={cn("w-12 h-6 rounded-full transition-colors relative", active ? "bg-red-500" : "bg-green-500")}>
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", active ? "left-6" : "left-0.5")} />
            </button>
            <span className={cn("text-sm font-medium", active ? "text-red-600" : "text-slate-400")}>да</span>
          </div>
        </div>
        {active && (
          extraContent ? extraContent(grossIncome, netIncome) : (
            <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                <Input type="number" value={compensation} readOnly className="rounded-lg bg-slate-100 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                <Input type="number" value={missing} readOnly className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, netIncome))} /></div>
            </div>
          )
        )}
      </div>
    );
  };

  const MaternityContent = (grossIncome, netIncome) => {
    const compYear1 = calculateMaternityYear1(grossIncome);
    const missingYear1 = Math.max(0, netIncome - compYear1);
    const missingYear2 = Math.max(0, netIncome - maternityYear2);
    return (
      <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 1-ва год. (€)</Label>
          <Input type="number" value={compYear1} readOnly className="rounded-lg bg-slate-100 text-sm" /></div>
        <div className="space-y-1"><Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 1-ва год. (€)</Label>
          <Input type="number" value={missingYear1} readOnly className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear1, netIncome))} /></div>
        <div className="space-y-1"><Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 2-ра год. (€)</Label>
          <Input type="number" value={maternityYear2} readOnly className="rounded-lg bg-slate-100 text-sm" /></div>
        <div className="space-y-1"><Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 2-ра год. (€)</Label>
          <Input type="number" value={missingYear2} readOnly className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear2, netIncome))} /></div>
      </div>
    );
  };

  const IncomeProtectionBlock = ({ hasField, insurerField, dateField, grossIncome, netIncome, age, retirementAge }) => {
    const hasProtection = data[hasField] ?? false;
    const yearsToRetirement = Math.max(0, (retirementAge || 65) - (age || 0));
    let humanCapital = 0;
    let inc = (netIncome || 0) * 12;
    for (let i = 0; i < yearsToRetirement; i++) { humanCapital += inc; inc *= 1.03; }

    return (
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Подсигурени ли са Вашите доходи?</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !hasProtection ? "text-red-600" : "text-slate-400")}>не</span>
            <button type="button" onClick={() => onChange(hasField, !hasProtection)}
              className={cn("w-12 h-6 rounded-full transition-colors relative", hasProtection ? "bg-green-500" : "bg-red-500")}>
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", hasProtection ? "left-6" : "left-0.5")} />
            </button>
            <span className={cn("text-sm font-medium", hasProtection ? "text-green-600" : "text-slate-400")}>да</span>
          </div>
        </div>
        {hasProtection && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1" data-invalid={hasProtection && isFieldInvalid(data[insurerField]) ? "true" : undefined}>
              <Label className="text-xs text-slate-500">Застраховател <span className="text-red-500">*</span></Label>
              <Combobox options={INSURANCE_COMPANIES} value={data[insurerField] || ''} onValueChange={v => onChange(insurerField, v)}
                placeholder="Търси застраховател..." searchPlaceholder="Търси..." emptyText="Няма намерен застраховател."
                triggerClassName={`rounded-lg text-sm ${hasProtection && isFieldInvalid(data[insurerField]) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <div className="space-y-1" data-invalid={hasProtection && isFieldInvalid(data[dateField]) ? "true" : undefined}>
              <Label className="text-xs text-slate-500">Дата на сключване <span className="text-red-500">*</span></Label>
              <BulgarianDateInput value={data[dateField] || ''} onChange={v => onChange(dateField, v)}
                className={`rounded-lg text-sm ${hasProtection && isFieldInvalid(data[dateField]) ? 'border-red-500 bg-red-50' : ''}`} required />
            </div>
          </div>
        )}
        {data.income_source && data.income_source !== 'rent' && data.income_source !== 'investments' && humanCapital > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <span className="font-bold">Вашият трудов капитал е {Math.round(humanCapital).toLocaleString('bg-BG')} €.</span>{' '}
              Вашите доходи са пряко свързани със способността Ви да работите. Съветваме Ви да обмислите защита на Вашия доход!
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Property Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Защита на собствеността', 'Property Protection')}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">{t('Какво имущество притежавате?', 'What property do you own?')}</p>

        <div className="space-y-6">
          {/* Property 1 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /><Label className="font-medium">{t('Недвижимо имущество', 'Real estate')}</Label></div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", !(data.has_property_1 ?? false) ? "text-red-600" : "text-slate-400")}>{t('няма', 'none')}</span>
                <button type="button" onClick={() => onChange('has_property_1', !(data.has_property_1 ?? false))}
                  className={cn("w-12 h-6 rounded-full transition-colors relative", (data.has_property_1 ?? false) ? "bg-green-500" : "bg-red-500")}>
                  <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", (data.has_property_1 ?? false) ? "left-6" : "left-0.5")} />
                </button>
                <span className={cn("text-sm font-medium", (data.has_property_1 ?? false) ? "text-green-600" : "text-slate-400")}>{t('има', 'has')}</span>
              </div>
            </div>
            {data.has_property_1 && (
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                {data.current_housing === 'owned' && (
                  <Button variant="outline" size="sm" onClick={importFromHousing} className="rounded-full mb-2">
                    <Download className="h-4 w-4 mr-2" />{t('Вземи данни от "Ново жилище"', 'Import from "Housing" step')}
                  </Button>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['property_1_address','Адрес','text'],['property_1_rooms','Брой стаи','number'],['property_1_area','Застроена площ (кв.м)','number'],['property_1_value','Стойност (€)','number']].map(([field,label,type]) => (
                    <div key={field} className="space-y-2" data-invalid={data.has_property_1 && isFieldInvalid(data[field]) ? "true" : undefined}>
                      <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
                      <Input type={type} min={type==='number'?'0':undefined} value={data[field] ?? ''}
                        onChange={e => onChange(field, e.target.value === '' ? '' : type === 'number' ? parseInt(e.target.value) : e.target.value)}
                        className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data[field]) ? 'border-red-500 bg-red-50' : ''}`} required />
                    </div>
                  ))}
                  <div className="space-y-2 sm:col-span-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_movable_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност на движимото имущество (€) <span className="text-red-500">*</span></Label>
                    <Input type="number" min="0" value={data.property_1_movable_value ?? ''}
                      onChange={e => onChange('property_1_movable_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_movable_value) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                </div>
                <PropertyInsuranceBlock prefix="property_1" />
              </div>
            )}
            {data.has_property_1 && !data.has_property_2 && (
              <Button variant="outline" size="sm" onClick={() => onChange('has_property_2', true)} className="rounded-full ml-6">
                <Plus className="h-4 w-4 mr-2" />{t('Добави втори имот', 'Add second property')}
              </Button>
            )}
          </div>

          {/* Property 2 */}
          {data.has_property_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /><Label className="font-medium">{t('Втори имот', 'Second property')}</Label></div>
                <Switch checked={data.has_property_2 || false} onCheckedChange={c => onChange('has_property_2', c)} />
              </div>
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['property_2_address','Адрес','text'],['property_2_rooms','Брой стаи','number'],['property_2_area','Застроена площ (кв.м)','number'],['property_2_value','Стойност (€)','number']].map(([field,label,type]) => (
                    <div key={field} className="space-y-2" data-invalid={data.has_property_2 && isFieldInvalid(data[field]) ? "true" : undefined}>
                      <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
                      <Input type={type} min={type==='number'?'0':undefined} value={data[field] ?? ''}
                        onChange={e => onChange(field, e.target.value === '' ? '' : type === 'number' ? parseInt(e.target.value) : e.target.value)}
                        className={`rounded-lg ${data.has_property_2 && isFieldInvalid(data[field]) ? 'border-red-500 bg-red-50' : ''}`} required />
                    </div>
                  ))}
                  <div className="space-y-2 sm:col-span-2" data-invalid={data.has_property_2 && isFieldInvalid(data.property_2_movable_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност на движимото имущество (€) <span className="text-red-500">*</span></Label>
                    <Input type="number" min="0" value={data.property_2_movable_value ?? ''}
                      onChange={e => onChange('property_2_movable_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_2 && isFieldInvalid(data.property_2_movable_value) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                </div>
                <PropertyInsuranceBlock prefix="property_2" />
              </div>
              {!data.has_property_3 && (
                <Button variant="outline" size="sm" onClick={() => onChange('has_property_3', true)} className="rounded-full ml-6">
                  <Plus className="h-4 w-4 mr-2" />{t('Добави трети имот', 'Add third property')}
                </Button>
              )}
            </div>
          )}

          {/* Property 3 */}
          {data.has_property_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /><Label className="font-medium">{t('Трети имот', 'Third property')}</Label></div>
                <Switch checked={data.has_property_3 || false} onCheckedChange={c => onChange('has_property_3', c)} />
              </div>
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['property_3_address','Адрес','text'],['property_3_rooms','Брой стаи','number'],['property_3_area','Застроена площ (кв.м)','number'],['property_3_value','Стойност (€)','number']].map(([field,label,type]) => (
                    <div key={field} className="space-y-2" data-invalid={data.has_property_3 && isFieldInvalid(data[field]) ? "true" : undefined}>
                      <Label className="text-sm">{label} <span className="text-red-500">*</span></Label>
                      <Input type={type} min={type==='number'?'0':undefined} value={data[field] ?? ''}
                        onChange={e => onChange(field, e.target.value === '' ? '' : type === 'number' ? parseInt(e.target.value) : e.target.value)}
                        className={`rounded-lg ${data.has_property_3 && isFieldInvalid(data[field]) ? 'border-red-500 bg-red-50' : ''}`} required />
                    </div>
                  ))}
                  <div className="space-y-2 sm:col-span-2" data-invalid={data.has_property_3 && isFieldInvalid(data.property_3_movable_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност на движимото имущество (€) <span className="text-red-500">*</span></Label>
                    <Input type="number" min="0" value={data.property_3_movable_value ?? ''}
                      onChange={e => onChange('property_3_movable_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_3 && isFieldInvalid(data.property_3_movable_value) ? 'border-red-500 bg-red-50' : ''}`} required />
                  </div>
                </div>
                <PropertyInsuranceBlock prefix="property_3" />
              </div>
            </div>
          )}

          {/* Car 1 */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Car className="h-4 w-4 text-slate-500" /><Label className="font-medium">Автомобил</Label></div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", !(data.has_car_1 ?? false) ? "text-red-600" : "text-slate-400")}>{t('няма', 'none')}</span>
                <button type="button" onClick={() => onChange('has_car_1', !(data.has_car_1 ?? false))}
                  className={cn("w-12 h-6 rounded-full transition-colors relative", (data.has_car_1 ?? false) ? "bg-green-500" : "bg-red-500")}>
                  <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", (data.has_car_1 ?? false) ? "left-6" : "left-0.5")} />
                </button>
                <span className={cn("text-sm font-medium", (data.has_car_1 ?? false) ? "text-green-600" : "text-slate-400")}>{t('има', 'has')}</span>
              </div>
            </div>
            {data.has_car_1 && <CarProtectionFields n={1} data={data} onChange={onChange} showErrors={showErrors} />}
            {data.has_car_1 && !data.has_car_2 && (
              <Button variant="outline" size="sm" onClick={() => onChange('has_car_2', true)} className="rounded-full ml-6">
                <Plus className="h-4 w-4 mr-2" />{t('Добави втори автомобил', 'Add second car')}
              </Button>
            )}
          </div>

          {/* Car 2 */}
          {data.has_car_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Car className="h-4 w-4 text-slate-500" /><Label className="font-medium">{t('Втори автомобил', 'Second car')}</Label></div>
                <Switch checked={data.has_car_2 || false} onCheckedChange={c => onChange('has_car_2', c)} />
              </div>
              <CarProtectionFields n={2} data={data} onChange={onChange} showErrors={showErrors} />
              {!data.has_car_3 && (
                <Button variant="outline" size="sm" onClick={() => onChange('has_car_3', true)} className="rounded-full ml-6">
                  <Plus className="h-4 w-4 mr-2" />{t('Добави трети автомобил', 'Add third car')}
                </Button>
              )}
            </div>
          )}

          {/* Car 3 */}
          {data.has_car_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Car className="h-4 w-4 text-slate-500" /><Label className="font-medium">{t('Трети автомобил', 'Third car')}</Label></div>
                <Switch checked={data.has_car_3 || false} onCheckedChange={c => onChange('has_car_3', c)} />
              </div>
              <CarProtectionFields n={3} data={data} onChange={onChange} showErrors={showErrors} />
            </div>
          )}
        </div>
      </div>

      {/* Property Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{t('Кой от Вашите приятели и познати:', 'Which of your friends and acquaintances:')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            ['property_referrals_significant', t('Има по-значително имущество, което е добре да бъде защитено?', 'Has significant property that should be protected?')],
            ['property_referrals_expensive_car', t('Има по-скъп автомобил/и?', 'Has an expensive car or cars?')]
          ].map(([field, label]) => (
            <div key={field} className="space-y-3">
              <Label className="text-slate-700">{label}</Label>
              {(data[field]?.length > 0 ? data[field] : ['']).map((name, index) => {
                const isDuplicate = isDuplicateName(name);
                const list = data[field]?.length > 0 ? data[field] : [''];
                return (
                  <div key={`${field}_${index}`}>
                    <Input placeholder={t('Име на познат', 'Name of acquaintance')} value={name}
                      onChange={e => {
                        const newList = [...list];
                        newList[index] = e.target.value;
                        if (index === newList.length - 1 && e.target.value) newList.push('');
                        onChange(field, newList);
                      }}
                      className={cn("rounded-lg", isDuplicate && "border-amber-500")} />
                    {isDuplicate && <p className="text-amber-600 text-sm mt-1">Това име бе предоставено на предходните теми. С кого бихме могли да го заменим?</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hasAnyAsset && (
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
          <Checkbox checked={data.include_property_in_plan || false} onCheckedChange={c => onChange('include_property_in_plan', c)} />
          <span className="font-medium text-blue-800">{t('Да бъде включено във финансовия план', 'Include in financial plan')}</span>
        </label>
      )}

      {/* Income Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">{t('Подсигуряване на доходите', 'Income Protection')}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2" data-invalid={isFieldInvalid(data.income_source) ? "true" : undefined}>
            <Label>{t('От къде идват Вашите доходи?', 'Where does your income come from?')} <span className="text-red-500">*</span></Label>
            <Select value={data.income_source || ''} onValueChange={v => onChange('income_source', v)}>
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.income_source) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder={t('Изберете', 'Select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">{t('Работа по трудов договор', 'Employment')}</SelectItem>
                <SelectItem value="self_employed">{t('Собствен бизнес', 'Self-employed / own business')}</SelectItem>
                <SelectItem value="rent">{t('Наем', 'Rental income')}</SelectItem>
                <SelectItem value="investments">{t('Инвестиции', 'Investments')}</SelectItem>
                <SelectItem value="mixed">{t('Смесени източници', 'Mixed sources')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">{t('Какво би се отразило негативно върху Вашите доходи?', 'What could negatively affect your income?')}</p>
            <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
              {/* Client Column */}
              <div>
                <div className="flex items-center gap-2 mb-4"><User className="h-4 w-4 text-slate-500" /><span className="font-medium text-slate-700">{clientName}</span></div>
                <div className="space-y-4">
                  <RiskRow label={t('Съкращение', 'Layoff')} field="client_risk_layoff" grossIncome={clientGrossIncome} netIncome={clientNetIncome} calcFn={calculateLayoffCompensation} />
                  <RiskRow label={t('Отпуск по майчинство', 'Maternity leave')} field="client_risk_maternity" grossIncome={clientGrossIncome} netIncome={clientNetIncome} calcFn={calculateMaternityYear1} extraContent={MaternityContent} />
                  <RiskRow label={t('Болнични', 'Sick leave')} field="client_risk_sick_leave" grossIncome={clientGrossIncome} netIncome={clientNetIncome} calcFn={calculateSickLeaveCompensation} />
                  <RiskRow label={t('Инвалидност', 'Disability')} field="client_risk_disability" grossIncome={clientGrossIncome} netIncome={clientNetIncome} calcFn={calculateDisabilityCompensation} />
                  <RiskRow label={t('Смърт', 'Death')} field="client_risk_death" grossIncome={clientGrossIncome} netIncome={clientNetIncome} calcFn={calculateDeathCompensation} />
                  <IncomeProtectionBlock hasField="client_has_income_protection" insurerField="client_income_protection_insurer" dateField="client_income_protection_date" grossIncome={clientGrossIncome} netIncome={clientNetIncome} age={data.client_age} retirementAge={data.client_retirement_age} />
                </div>
              </div>

              {/* Partner Column */}
              {includePartner && (
                <div>
                  <div className="flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-slate-500" /><span className="font-medium text-slate-700">{partnerName}</span></div>
                  <div className="space-y-4">
                    <RiskRow label={t('Съкращение', 'Layoff')} field="partner_risk_layoff" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} calcFn={calculateLayoffCompensation} />
                    <RiskRow label={t('Отпуск по майчинство', 'Maternity leave')} field="partner_risk_maternity" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} calcFn={calculateMaternityYear1} extraContent={MaternityContent} />
                    <RiskRow label={t('Болнични', 'Sick leave')} field="partner_risk_sick_leave" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} calcFn={calculateSickLeaveCompensation} />
                    <RiskRow label={t('Инвалидност', 'Disability')} field="partner_risk_disability" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} calcFn={calculateDisabilityCompensation} />
                    <RiskRow label={t('Смърт', 'Death')} field="partner_risk_death" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} calcFn={calculateDeathCompensation} />
                    <IncomeProtectionBlock hasField="partner_has_income_protection" insurerField="partner_income_protection_insurer" dateField="partner_income_protection_date" grossIncome={partnerGrossIncome} netIncome={partnerNetIncome} age={data.partner_age} retirementAge={data.partner_retirement_age} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employer Health Insurance */}
      {(() => {
        const HEALTH_INSURERS = [
          { value: 'doverie', label: 'ЗК „Доверие" АД' },
          { value: 'nadezhda', label: 'ЗК „Надежда" АД' },
          { value: 'dzi_oz', label: 'ЗК „ДЗИ – ОЗ" АД (ДЗИ)' },
          { value: 'euroins_health', label: 'ЗД „Евроинс – Здравноосигуряване" АД' },
          { value: 'medico21', label: 'ЗК „Медико-21" АД' },
          { value: 'zoi', label: 'ЗК Здравноосигурителен институт АД' },
          { value: 'dallbogg_health', label: 'ЗЕАД „Дал Богг Живот и Здраве"' },
          { value: 'bulstrad_health', label: 'ЗК „Булстрад"' },
          { value: 'obshtinska', label: 'ЗК Общинска здравно-осигурителна каса' },
          { value: 'fi_health', label: 'ЗК „Фи Хелт"' },
          { value: 'uniqa_life', label: 'ЗК „Уника Живот" АД' },
          { value: 'saglasie', label: 'ЗК „Съгласие"' },
          { value: 'generali_hospital', label: 'ЗК „Дженерали – Болнична помощ"' },
          { value: 'bulgaria_ins', label: 'ЗК „България Иншурънс" АД' },
          { value: 'unknown', label: 'Не знам, ще проверя' },
        ];
        const cName = [data.client_first_name, data.client_last_name].filter(Boolean).join(' ') || 'Клиент';
        const pName = [data.partner_first_name, data.partner_last_name].filter(Boolean).join(' ') || 'Партньор';
        const HealthRow = ({ label, fieldHas, fieldInsurer }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-800">{label}</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", !(data[fieldHas] ?? false) ? "text-red-600" : "text-slate-400")}>не</span>
                <button type="button" onClick={() => { const v = !(data[fieldHas] ?? false); onChange(fieldHas, v); if (!v) onChange(fieldInsurer, ''); }}
                  className={cn("w-12 h-6 rounded-full transition-colors relative", (data[fieldHas] ?? false) ? "bg-green-500" : "bg-red-500")}>
                  <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", (data[fieldHas] ?? false) ? "left-6" : "left-0.5")} />
                </button>
                <span className={cn("text-sm font-medium", (data[fieldHas] ?? false) ? "text-green-600" : "text-slate-400")}>да</span>
              </div>
            </div>
            {data[fieldHas] && (
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Застраховател</Label>
                <Combobox options={HEALTH_INSURERS} value={data[fieldInsurer] || ''} onValueChange={v => onChange(fieldInsurer, v)}
                  placeholder="Търси застраховател..." searchPlaceholder="Търси..." emptyText="Няма намерен застраховател."
                  triggerClassName="rounded-lg" />
              </div>
            )}
          </div>
        );
        return (
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
            <p className="font-medium text-slate-900">{t('Работодателска здравна застраховка', 'Employer health insurance')}</p>
            <HealthRow label={cName} fieldHas="has_employer_health_insurance" fieldInsurer="employer_health_insurer" />
            {data.include_partner && (<><div className="border-t border-slate-200" /><HealthRow label={pName} fieldHas="partner_has_employer_health_insurance" fieldInsurer="partner_employer_health_insurer" /></>)}
          </div>
        );
      })()}

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox checked={data.include_income_protection_in_plan || false} onCheckedChange={c => onChange('include_income_protection_in_plan', c)} />
        <span className="font-medium text-blue-800">{t('Да бъде включено във финансовия план', 'Include in financial plan')}</span>
      </label>
    </div>
  );
}