import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import BulgarianDateInput from '@/components/ui/BulgarianDateInput';
import { cn } from "@/lib/utils";
import { MapPin } from 'lucide-react';
import { getRegionFromPlate, REGION_NAMES, ENGINE_SIZE_OPTIONS } from './CarRegionHelper';

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

/**
 * CarProtectionFields — поле за един автомобил (n = 1, 2 или 3)
 * Пропс:
 *   n          - номер (1|2|3)
 *   data       - целият обект с данни
 *   onChange   - onChange(field, value)
 *   showErrors - bool
 */
export default function CarProtectionFields({ n, data, onChange, showErrors }) {
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);

  const f = (field) => `car_${n}_${field}`;
  const v = (field) => data[f(field)];
  const set = (field, val) => onChange(f(field), val);

  const hasCarKey = `has_car_${n}`;
  const hasCar = data[hasCarKey] ?? false;

  // Auto-detect region from plate
  const detectedRegion = getRegionFromPlate(v('reg_number') || '');

  return (
    <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
      {/* Basic info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2" data-invalid={hasCar && isFieldInvalid(v('brand')) ? "true" : undefined}>
          <Label className="text-sm">Марка <span className="text-red-500">*</span></Label>
          <Input value={v('brand') || ''} onChange={e => set('brand', e.target.value)}
            className={`rounded-lg ${hasCar && isFieldInvalid(v('brand')) ? 'border-red-500 bg-red-50' : ''}`} required />
        </div>
        <div className="space-y-2" data-invalid={hasCar && isFieldInvalid(v('model')) ? "true" : undefined}>
          <Label className="text-sm">Модел <span className="text-red-500">*</span></Label>
          <Input value={v('model') || ''} onChange={e => set('model', e.target.value)}
            className={`rounded-lg ${hasCar && isFieldInvalid(v('model')) ? 'border-red-500 bg-red-50' : ''}`} required />
        </div>
        <div className="space-y-2" data-invalid={hasCar && isFieldInvalid(v('year')) ? "true" : undefined}>
          <Label className="text-sm">Година на производство <span className="text-red-500">*</span></Label>
          <Input type="number" min="1900" max="2026" value={v('year') ?? ''}
            onChange={e => set('year', e.target.value === '' ? '' : parseInt(e.target.value))}
            className={`rounded-lg ${hasCar && isFieldInvalid(v('year')) ? 'border-red-500 bg-red-50' : ''}`} required />
        </div>
        <div className="space-y-2" data-invalid={hasCar && isFieldInvalid(v('value')) ? "true" : undefined}>
          <Label className="text-sm">Стойност (€) <span className="text-red-500">*</span></Label>
          <Input type="number" min="0" value={v('value') ?? ''}
            onChange={e => set('value', e.target.value === '' ? '' : parseInt(e.target.value))}
            className={`rounded-lg ${hasCar && isFieldInvalid(v('value')) ? 'border-red-500 bg-red-50' : ''}`} required />
        </div>

        {/* Registration number + auto-detected region */}
        <div className="space-y-2">
          <Label className="text-sm">Регистрационен номер</Label>
          <Input value={v('reg_number') || ''} onChange={e => set('reg_number', e.target.value.toUpperCase())}
            className="rounded-lg uppercase" placeholder="напр. СА 1234 АВ" />
          {detectedRegion && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MapPin className="h-3 w-3" />
              <span>{REGION_NAMES[detectedRegion]}</span>
            </div>
          )}
        </div>

        {/* Engine size */}
        <div className="space-y-2">
          <Label className="text-sm">Кубатура на двигателя</Label>
          <Select value={v('engine_size') || ''} onValueChange={val => set('engine_size', val)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Изберете кубатура" />
            </SelectTrigger>
            <SelectContent>
              {ENGINE_SIZE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* GO Insurance */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="space-y-2" data-invalid={hasCar && isFieldInvalid(v('go_insurer')) ? "true" : undefined}>
          <Label className="text-sm">ГО-Застраховател <span className="text-red-500">*</span></Label>
          <Combobox options={INSURANCE_COMPANIES} value={v('go_insurer') || ''}
            onValueChange={val => set('go_insurer', val)}
            placeholder="Търси застраховател..." searchPlaceholder="Търси..." emptyText="Няма намерен застраховател."
            triggerClassName={`rounded-lg ${hasCar && isFieldInvalid(v('go_insurer')) ? 'border-red-500 bg-red-50' : ''}`} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Месечна сума по ГО (€)</Label>
          <Input type="number" min="0" value={v('go_monthly') ?? ''}
            onChange={e => set('go_monthly', e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="rounded-lg w-40" placeholder="0" />
        </div>
      </div>

      {/* Casco */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="cursor-pointer">Имате ли Каско?</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !v('has_casco') ? "text-red-600" : "text-slate-400")}>не</span>
            <button type="button"
              onClick={() => set('has_casco', !v('has_casco'))}
              className={cn("w-12 h-6 rounded-full transition-colors relative", v('has_casco') ? "bg-green-500" : "bg-red-500")}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all", v('has_casco') ? "left-6" : "left-0.5")} />
            </button>
            <span className={cn("text-sm font-medium", v('has_casco') ? "text-green-600" : "text-slate-400")}>да</span>
          </div>
        </div>
        {v('has_casco') && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2" data-invalid={v('has_casco') && isFieldInvalid(v('casco_insurer')) ? "true" : undefined}>
              <Label className="text-sm">Застраховател <span className="text-red-500">*</span></Label>
              <Combobox options={INSURANCE_COMPANIES} value={v('casco_insurer') || ''}
                onValueChange={val => set('casco_insurer', val)}
                placeholder="Търси застраховател..." searchPlaceholder="Търси..." emptyText="Няма намерен застраховател."
                triggerClassName={`rounded-lg ${v('has_casco') && isFieldInvalid(v('casco_insurer')) ? 'border-red-500 bg-red-50' : ''}`} />
            </div>
            <div className="space-y-2" data-invalid={v('has_casco') && isFieldInvalid(v('casco_expiry')) ? "true" : undefined}>
              <Label className="text-sm">Срок на полицата (дд.мм.гггг) <span className="text-red-500">*</span></Label>
              <BulgarianDateInput value={v('casco_expiry') || ''} onChange={val => set('casco_expiry', val)}
                className={`rounded-lg ${v('has_casco') && isFieldInvalid(v('casco_expiry')) ? 'border-red-500 bg-red-50' : ''}`} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Месечна сума по Каско (€)</Label>
              <Input type="number" min="0" value={v('casco_monthly') ?? ''}
                onChange={e => set('casco_monthly', e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="rounded-lg w-40" placeholder="0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}