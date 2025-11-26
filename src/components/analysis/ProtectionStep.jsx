import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Shield, Wallet, Building2, Car, Plus, Download, User, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import BulgarianDateInput from '@/components/ui/BulgarianDateInput';

// Insurance companies list
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

export default function ProtectionStep({ data, onChange, showErrors }) {
  // Helper to check if a field is invalid
  const isFieldInvalid = (value) => showErrors && (value === undefined || value === '' || value === null);
  const includePartner = data.include_partner || false;
  
  // Check if any property or car exists
  const hasAnyProperty = data.has_property_1 || false;
  const hasAnyCar = data.has_car_1 || false;
  const hasAnyAsset = hasAnyProperty || hasAnyCar;

  // Helper to import data from housing section
  const importFromHousing = () => {
    if (data.current_housing === 'owned') {
      onChange('property_1_address', data.current_housing_address || data.client_address || '');
      onChange('property_1_rooms', data.current_housing_rooms || '');
      onChange('property_1_area', data.current_housing_area || '');
      onChange('property_1_value', data.current_housing_value || '');
      onChange('property_1_movable_value', data.current_housing_movable_value || '');
    }
  };

  // Get all existing referral names from other sections
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
    const existingNames = getExistingNames();
    return existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
  };

  // Calculate compensation for layoff (60% of gross, min 320, max 1730)
  const calculateLayoffCompensation = (grossIncome) => {
    if (!grossIncome) return 0;
    const compensation = Math.round(grossIncome * 0.60);
    return Math.max(320, Math.min(1730, compensation));
  };

  // Calculate sick leave compensation (60% of gross, min 320, max 1730)
  const calculateSickLeaveCompensation = (grossIncome) => {
    if (!grossIncome) return 0;
    const compensation = Math.round(grossIncome * 0.60);
    return Math.max(320, Math.min(1730, compensation));
  };

  // Calculate maternity compensation year 1 (77% of gross, min 476, max 1540)
  const calculateMaternityYear1 = (grossIncome) => {
    if (!grossIncome) return 0;
    const compensation = Math.round(grossIncome * 0.77);
    return Math.max(476, Math.min(1540, compensation));
  };

  // Maternity year 2 is fixed at 398
  const maternityYear2 = 398;

  // Calculate death compensation (22% of gross, min 153, max 511)
  const calculateDeathCompensation = (grossIncome) => {
    if (!grossIncome) return 0;
    const compensation = Math.round(grossIncome * 0.22);
    return Math.max(153, Math.min(511, compensation));
  };

  // Calculate disability compensation (49% of gross, min 343, max 1730)
  const calculateDisabilityCompensation = (grossIncome) => {
    if (!grossIncome) return 0;
    const compensation = Math.round(grossIncome * 0.49);
    return Math.max(343, Math.min(1730, compensation));
  };

  // Get background color based on missing income severity
  const getMissingIncomeColor = (missingIncome, netIncome) => {
    if (!missingIncome || missingIncome <= 0) return 'bg-slate-100';
    const ratio = netIncome > 0 ? missingIncome / netIncome : 0;
    if (ratio >= 0.7) return 'bg-red-200';
    if (ratio >= 0.5) return 'bg-red-100';
    if (ratio >= 0.3) return 'bg-amber-100';
    return 'bg-yellow-50';
  };

  // Get income data
  const clientGrossIncome = data.client_gross_income_pension || 0;
  const partnerGrossIncome = data.partner_gross_income_pension || 0;
  const clientNetIncome = data.client_monthly_net_income || 0;
  const partnerNetIncome = data.partner_monthly_net_income || 0;

  return (
    <div className="space-y-8">
      {/* Property Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Защита на собствеността</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">Какво имущество притежавате?</p>

        <div className="space-y-6">
          {/* Property 1 - Main */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Недвижимо имущество</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", !(data.has_property_1 ?? false) ? "text-red-600" : "text-slate-400")}>няма</span>
                <button
                  type="button"
                  onClick={() => onChange('has_property_1', !(data.has_property_1 ?? false))}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    (data.has_property_1 ?? false) ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                    (data.has_property_1 ?? false) ? "left-6" : "left-0.5"
                  )} />
                </button>
                <span className={cn("text-sm font-medium", (data.has_property_1 ?? false) ? "text-green-600" : "text-slate-400")}>има</span>
              </div>
            </div>

            {data.has_property_1 && (
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                {data.current_housing === 'owned' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={importFromHousing}
                    className="rounded-full mb-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Вземи данни от "Ново жилище"
                  </Button>
                )}
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_address) ? "true" : undefined}>
                    <Label className="text-sm">Адрес <span className="text-red-500">*</span></Label>
                    <Input
                      value={data.property_1_address || ''}
                      onChange={(e) => onChange('property_1_address', e.target.value)}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_address) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_rooms) ? "true" : undefined}>
                    <Label className="text-sm">Брой стаи <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.property_1_rooms ?? ''}
                      onChange={(e) => onChange('property_1_rooms', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_rooms) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_area) ? "true" : undefined}>
                    <Label className="text-sm">Застроена площ (кв.м) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.property_1_area ?? ''}
                      onChange={(e) => onChange('property_1_area', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_area) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност (€) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.property_1_value ?? ''}
                      onChange={(e) => onChange('property_1_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_value) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2" data-invalid={data.has_property_1 && isFieldInvalid(data.property_1_movable_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност на движимото имущество (€) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.property_1_movable_value ?? ''}
                      onChange={(e) => onChange('property_1_movable_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_property_1 && isFieldInvalid(data.property_1_movable_value) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                </div>

                {/* Property 1 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", !(data.property_1_has_insurance ?? false) ? "text-red-600" : "text-slate-400")}>не</span>
                      <button
                        type="button"
                        onClick={() => onChange('property_1_has_insurance', !(data.property_1_has_insurance ?? false))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          (data.property_1_has_insurance ?? false) ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                          (data.property_1_has_insurance ?? false) ? "left-6" : "left-0.5"
                        )} />
                      </button>
                      <span className={cn("text-sm font-medium", (data.property_1_has_insurance ?? false) ? "text-green-600" : "text-slate-400")}>да</span>
                    </div>
                  </div>
                  {data.property_1_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2" data-invalid={data.property_1_has_insurance && isFieldInvalid(data.property_1_insurer) ? "true" : undefined}>
                        <Label className="text-sm">Застраховател <span className="text-red-500">*</span></Label>
                        <Select 
                          value={data.property_1_insurer || ''} 
                          onValueChange={(value) => onChange('property_1_insurer', value)}
                        >
                          <SelectTrigger className={`rounded-lg ${data.property_1_has_insurance && isFieldInvalid(data.property_1_insurer) ? 'border-red-500 bg-red-50' : ''}`}>
                            <SelectValue placeholder="Изберете" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSURANCE_COMPANIES.map(ins => (
                              <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2" data-invalid={data.property_1_has_insurance && isFieldInvalid(data.property_1_insurance_expiry) ? "true" : undefined}>
                        <Label className="text-sm">Срок на полицата (дд.мм.гггг) <span className="text-red-500">*</span></Label>
                        <BulgarianDateInput
                          value={data.property_1_insurance_expiry || ''}
                          onChange={(value) => onChange('property_1_insurance_expiry', value)}
                          className={`rounded-lg ${data.property_1_has_insurance && isFieldInvalid(data.property_1_insurance_expiry) ? 'border-red-500 bg-red-50' : ''}`}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Property 2 Button */}
            {data.has_property_1 && !data.has_property_2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onChange('has_property_2', true)}
                className="rounded-full ml-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави втори имот
              </Button>
            )}
          </div>

          {/* Property 2 */}
          {data.has_property_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Втори имот</Label>
                </div>
                <Switch
                  checked={data.has_property_2 || false}
                  onCheckedChange={(checked) => onChange('has_property_2', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Адрес</Label>
                    <Input
                      placeholder="гр. София, ул. ..."
                      value={data.property_2_address || ''}
                      onChange={(e) => onChange('property_2_address', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Брой стаи</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={data.property_2_rooms || ''}
                      onChange={(e) => onChange('property_2_rooms', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Застроена площ (кв.м)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="80"
                      value={data.property_2_area || ''}
                      onChange={(e) => onChange('property_2_area', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.property_2_value || ''}
                      onChange={(e) => onChange('property_2_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Стойност на движимото имущество (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10000"
                      value={data.property_2_movable_value || ''}
                      onChange={(e) => onChange('property_2_movable_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Property 2 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <Switch
                      checked={data.property_2_has_insurance || false}
                      onCheckedChange={(checked) => onChange('property_2_has_insurance', checked)}
                    />
                  </div>
                  {data.property_2_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.property_2_insurer || ''}
                          onChange={(e) => onChange('property_2_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.property_2_insurance_expiry || ''}
                          onChange={(e) => onChange('property_2_insurance_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Property 3 Button */}
              {!data.has_property_3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChange('has_property_3', true)}
                  className="rounded-full ml-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добави трети имот
                </Button>
              )}
            </div>
          )}

          {/* Property 3 */}
          {data.has_property_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Трети имот</Label>
                </div>
                <Switch
                  checked={data.has_property_3 || false}
                  onCheckedChange={(checked) => onChange('has_property_3', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Адрес</Label>
                    <Input
                      placeholder="гр. София, ул. ..."
                      value={data.property_3_address || ''}
                      onChange={(e) => onChange('property_3_address', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Брой стаи</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={data.property_3_rooms || ''}
                      onChange={(e) => onChange('property_3_rooms', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Застроена площ (кв.м)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="80"
                      value={data.property_3_area || ''}
                      onChange={(e) => onChange('property_3_area', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.property_3_value || ''}
                      onChange={(e) => onChange('property_3_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Стойност на движимото имущество (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10000"
                      value={data.property_3_movable_value || ''}
                      onChange={(e) => onChange('property_3_movable_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Property 3 Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли защита на имуществото?</Label>
                    <Switch
                      checked={data.property_3_has_insurance || false}
                      onCheckedChange={(checked) => onChange('property_3_has_insurance', checked)}
                    />
                  </div>
                  {data.property_3_has_insurance && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.property_3_insurer || ''}
                          onChange={(e) => onChange('property_3_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.property_3_insurance_expiry || ''}
                          onChange={(e) => onChange('property_3_insurance_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Car 1 */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-500" />
                <Label className="font-medium">Автомобил</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", !(data.has_car_1 ?? false) ? "text-red-600" : "text-slate-400")}>няма</span>
                <button
                  type="button"
                  onClick={() => onChange('has_car_1', !(data.has_car_1 ?? false))}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    (data.has_car_1 ?? false) ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                    (data.has_car_1 ?? false) ? "left-6" : "left-0.5"
                  )} />
                </button>
                <span className={cn("text-sm font-medium", (data.has_car_1 ?? false) ? "text-green-600" : "text-slate-400")}>има</span>
              </div>
            </div>

            {data.has_car_1 && (
              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2" data-invalid={data.has_car_1 && isFieldInvalid(data.car_1_brand) ? "true" : undefined}>
                    <Label className="text-sm">Марка <span className="text-red-500">*</span></Label>
                    <Input
                      value={data.car_1_brand || ''}
                      onChange={(e) => onChange('car_1_brand', e.target.value)}
                      className={`rounded-lg ${data.has_car_1 && isFieldInvalid(data.car_1_brand) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_car_1 && isFieldInvalid(data.car_1_model) ? "true" : undefined}>
                    <Label className="text-sm">Модел <span className="text-red-500">*</span></Label>
                    <Input
                      value={data.car_1_model || ''}
                      onChange={(e) => onChange('car_1_model', e.target.value)}
                      className={`rounded-lg ${data.has_car_1 && isFieldInvalid(data.car_1_model) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_car_1 && isFieldInvalid(data.car_1_year) ? "true" : undefined}>
                    <Label className="text-sm">Година на производство <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      value={data.car_1_year ?? ''}
                      onChange={(e) => onChange('car_1_year', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_car_1 && isFieldInvalid(data.car_1_year) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                  <div className="space-y-2" data-invalid={data.has_car_1 && isFieldInvalid(data.car_1_value) ? "true" : undefined}>
                    <Label className="text-sm">Стойност (€) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.car_1_value ?? ''}
                      onChange={(e) => onChange('car_1_value', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className={`rounded-lg ${data.has_car_1 && isFieldInvalid(data.car_1_value) ? 'border-red-500 bg-red-50' : ''}`}
                      required
                    />
                  </div>
                </div>

                {/* Car 1 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2" data-invalid={data.has_car_1 && isFieldInvalid(data.car_1_go_insurer) ? "true" : undefined}>
                    <Label className="text-sm">ГО-Застраховател <span className="text-red-500">*</span></Label>
                    <Select 
                      value={data.car_1_go_insurer || ''} 
                      onValueChange={(value) => onChange('car_1_go_insurer', value)}
                    >
                      <SelectTrigger className={`rounded-lg ${data.has_car_1 && isFieldInvalid(data.car_1_go_insurer) ? 'border-red-500 bg-red-50' : ''}`}>
                        <SelectValue placeholder="Изберете" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSURANCE_COMPANIES.map(ins => (
                          <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Car 1 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", !(data.car_1_has_casco ?? false) ? "text-red-600" : "text-slate-400")}>не</span>
                      <button
                        type="button"
                        onClick={() => onChange('car_1_has_casco', !(data.car_1_has_casco ?? false))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          (data.car_1_has_casco ?? false) ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                          (data.car_1_has_casco ?? false) ? "left-6" : "left-0.5"
                        )} />
                      </button>
                      <span className={cn("text-sm font-medium", (data.car_1_has_casco ?? false) ? "text-green-600" : "text-slate-400")}>да</span>
                    </div>
                  </div>
                  {data.car_1_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2" data-invalid={data.car_1_has_casco && isFieldInvalid(data.car_1_casco_insurer) ? "true" : undefined}>
                        <Label className="text-sm">Застраховател <span className="text-red-500">*</span></Label>
                        <Select 
                          value={data.car_1_casco_insurer || ''} 
                          onValueChange={(value) => onChange('car_1_casco_insurer', value)}
                        >
                          <SelectTrigger className={`rounded-lg ${data.car_1_has_casco && isFieldInvalid(data.car_1_casco_insurer) ? 'border-red-500 bg-red-50' : ''}`}>
                            <SelectValue placeholder="Изберете" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSURANCE_COMPANIES.map(ins => (
                              <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2" data-invalid={data.car_1_has_casco && isFieldInvalid(data.car_1_casco_expiry) ? "true" : undefined}>
                        <Label className="text-sm">Срок на полицата (дд.мм.гггг) <span className="text-red-500">*</span></Label>
                        <BulgarianDateInput
                          value={data.car_1_casco_expiry || ''}
                          onChange={(value) => onChange('car_1_casco_expiry', value)}
                          className={`rounded-lg ${data.car_1_has_casco && isFieldInvalid(data.car_1_casco_expiry) ? 'border-red-500 bg-red-50' : ''}`}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Car 2 Button */}
            {data.has_car_1 && !data.has_car_2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onChange('has_car_2', true)}
                className="rounded-full ml-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави втори автомобил
              </Button>
            )}
          </div>

          {/* Car 2 */}
          {data.has_car_2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Втори автомобил</Label>
                </div>
                <Switch
                  checked={data.has_car_2 || false}
                  onCheckedChange={(checked) => onChange('has_car_2', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Марка</Label>
                    <Input
                      placeholder="Toyota"
                      value={data.car_2_brand || ''}
                      onChange={(e) => onChange('car_2_brand', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Модел</Label>
                    <Input
                      placeholder="Corolla"
                      value={data.car_2_model || ''}
                      onChange={(e) => onChange('car_2_model', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Година на производство</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      placeholder="2020"
                      value={data.car_2_year || ''}
                      onChange={(e) => onChange('car_2_year', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15000"
                      value={data.car_2_value || ''}
                      onChange={(e) => onChange('car_2_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 2 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">ГО-Застраховател</Label>
                    <Input
                      placeholder="Име на застраховател"
                      value={data.car_2_go_insurer || ''}
                      onChange={(e) => onChange('car_2_go_insurer', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 2 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <Switch
                      checked={data.car_2_has_casco || false}
                      onCheckedChange={(checked) => onChange('car_2_has_casco', checked)}
                    />
                  </div>
                  {data.car_2_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.car_2_casco_insurer || ''}
                          onChange={(e) => onChange('car_2_casco_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.car_2_casco_expiry || ''}
                          onChange={(e) => onChange('car_2_casco_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Car 3 Button */}
              {!data.has_car_3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChange('has_car_3', true)}
                  className="rounded-full ml-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добави трети автомобил
                </Button>
              )}
            </div>
          )}

          {/* Car 3 */}
          {data.has_car_3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" />
                  <Label className="font-medium">Трети автомобил</Label>
                </div>
                <Switch
                  checked={data.has_car_3 || false}
                  onCheckedChange={(checked) => onChange('has_car_3', checked)}
                />
              </div>

              <div className="ml-6 p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Марка</Label>
                    <Input
                      placeholder="Toyota"
                      value={data.car_3_brand || ''}
                      onChange={(e) => onChange('car_3_brand', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Модел</Label>
                    <Input
                      placeholder="Corolla"
                      value={data.car_3_model || ''}
                      onChange={(e) => onChange('car_3_model', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Година на производство</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2025"
                      placeholder="2020"
                      value={data.car_3_year || ''}
                      onChange={(e) => onChange('car_3_year', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Стойност (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15000"
                      value={data.car_3_value || ''}
                      onChange={(e) => onChange('car_3_value', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 3 GO Insurance */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">ГО-Застраховател</Label>
                    <Input
                      placeholder="Име на застраховател"
                      value={data.car_3_go_insurer || ''}
                      onChange={(e) => onChange('car_3_go_insurer', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Car 3 Casco */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Имате ли Каско?</Label>
                    <Switch
                      checked={data.car_3_has_casco || false}
                      onCheckedChange={(checked) => onChange('car_3_has_casco', checked)}
                    />
                  </div>
                  {data.car_3_has_casco && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Застраховател</Label>
                        <Input
                          placeholder="Име на застраховател"
                          value={data.car_3_casco_insurer || ''}
                          onChange={(e) => onChange('car_3_casco_insurer', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Срок на полицата (дд/мм/гггг)</Label>
                        <Input
                          type="text"
                          placeholder="дд/мм/гггг"
                          value={data.car_3_casco_expiry || ''}
                          onChange={(e) => onChange('car_3_casco_expiry', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Кой от Вашите приятели и познати:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Has significant property */}
          <div className="space-y-3">
            <Label className="text-slate-700">Има по-значително имущество, което е добре да бъде защитено?</Label>
            {(data.property_referrals_significant || ['']).map((name, index) => {
              const isDuplicate = isDuplicateName(name);
              
              return (
                <div key={`significant_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.property_referrals_significant || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('property_referrals_significant', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходните теми. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Has expensive car */}
          <div className="space-y-3">
            <Label className="text-slate-700">Има по-скъп автомобил/и?</Label>
            {(data.property_referrals_expensive_car || ['']).map((name, index) => {
              const isDuplicate = isDuplicateName(name);
              
              return (
                <div key={`expensive_car_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.property_referrals_expensive_car || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('property_referrals_expensive_car', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходните теми. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Include property in plan - only show if any property or car exists */}
      {hasAnyAsset && (
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
          <Checkbox
            checked={data.include_property_in_plan || false}
            onCheckedChange={(checked) => onChange('include_property_in_plan', checked)}
          />
          <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
        </label>
      )}

      {/* Income Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Подсигуряване на доходите</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2" data-invalid={isFieldInvalid(data.income_source) ? "true" : undefined}>
            <Label>От къде идват Вашите доходи? <span className="text-red-500">*</span></Label>
            <Select 
              value={data.income_source || ''} 
              onValueChange={(value) => onChange('income_source', value)}
            >
              <SelectTrigger className={`rounded-lg ${isFieldInvalid(data.income_source) ? 'border-red-500 bg-red-50' : ''}`}>
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">Работа по трудов договор</SelectItem>
                <SelectItem value="self_employed">Собствен бизнес</SelectItem>
                <SelectItem value="rent">Наем</SelectItem>
                <SelectItem value="investments">Инвестиции</SelectItem>
                <SelectItem value="mixed">Смесени източници</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">Какво би се отразило негативно върху Вашите доходи?</p>
            
            <div className={includePartner ? "grid lg:grid-cols-2 gap-8" : ""}>
              {/* Client Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Клиент</span>
                </div>
                <div className="space-y-4">
                  {/* Layoff */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Съкращение</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_risk_layoff ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_risk_layoff', !(data.client_risk_layoff ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_risk_layoff ?? false) ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_risk_layoff ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_risk_layoff ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_risk_layoff && (() => {
                      const compensation = calculateLayoffCompensation(clientGrossIncome);
                      const missing = Math.max(0, clientNetIncome - compensation);
                      return (
                        <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                            <Input
                              type="number"
                              value={compensation}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                            <Input
                              type="number"
                              value={missing}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, clientNetIncome))}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Maternity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Отпуск по майчинство</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_risk_maternity ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_risk_maternity', !(data.client_risk_maternity ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_risk_maternity ?? false) ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_risk_maternity ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_risk_maternity ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_risk_maternity && (() => {
                      const compYear1 = calculateMaternityYear1(clientGrossIncome);
                      const missingYear1 = Math.max(0, clientNetIncome - compYear1);
                      const missingYear2 = Math.max(0, clientNetIncome - maternityYear2);
                      return (
                        <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 1-ва год. (€)</Label>
                            <Input
                              type="number"
                              value={compYear1}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 1-ва год. (€)</Label>
                            <Input
                              type="number"
                              value={missingYear1}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear1, clientNetIncome))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 2-ра год. (€)</Label>
                            <Input
                              type="number"
                              value={maternityYear2}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 2-ра год. (€)</Label>
                            <Input
                              type="number"
                              value={missingYear2}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear2, clientNetIncome))}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Sick Leave */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Болнични</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_risk_sick_leave ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_risk_sick_leave', !(data.client_risk_sick_leave ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_risk_sick_leave ?? false) ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_risk_sick_leave ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_risk_sick_leave ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_risk_sick_leave && (() => {
                      const compensation = calculateSickLeaveCompensation(clientGrossIncome);
                      const missing = Math.max(0, clientNetIncome - compensation);
                      return (
                        <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                            <Input
                              type="number"
                              value={compensation}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                            <Input
                              type="number"
                              value={missing}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, clientNetIncome))}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Disability */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Инвалидност</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_risk_disability ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_risk_disability', !(data.client_risk_disability ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_risk_disability ?? false) ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_risk_disability ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_risk_disability ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_risk_disability && (() => {
                      const compensation = calculateDisabilityCompensation(clientGrossIncome);
                      const missing = Math.max(0, clientNetIncome - compensation);
                      return (
                        <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                            <Input
                              type="number"
                              value={compensation}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                            <Input
                              type="number"
                              value={missing}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, clientNetIncome))}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Death */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Смърт</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_risk_death ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_risk_death', !(data.client_risk_death ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_risk_death ?? false) ? "bg-red-500" : "bg-green-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_risk_death ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_risk_death ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_risk_death && (() => {
                      const compensation = calculateDeathCompensation(clientGrossIncome);
                      const missing = Math.max(0, clientNetIncome - compensation);
                      return (
                        <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                            <Input
                              type="number"
                              value={compensation}
                              readOnly
                              className="rounded-lg bg-slate-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                            <Input
                              type="number"
                              value={missing}
                              readOnly
                              className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, clientNetIncome))}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Client Income Protection */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Подсигурени ли са Вашите доходи?</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !(data.client_has_income_protection ?? false) ? "text-red-600" : "text-slate-400")}>не</span>
                        <button
                          type="button"
                          onClick={() => onChange('client_has_income_protection', !(data.client_has_income_protection ?? false))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            (data.client_has_income_protection ?? false) ? "bg-green-500" : "bg-red-500"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                            (data.client_has_income_protection ?? false) ? "left-6" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-sm font-medium", (data.client_has_income_protection ?? false) ? "text-green-600" : "text-slate-400")}>да</span>
                      </div>
                    </div>
                    {data.client_has_income_protection && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1" data-invalid={data.client_has_income_protection && isFieldInvalid(data.client_income_protection_insurer) ? "true" : undefined}>
                          <Label className="text-xs text-slate-500">Застраховател <span className="text-red-500">*</span></Label>
                          <Select 
                            value={data.client_income_protection_insurer || ''} 
                            onValueChange={(value) => onChange('client_income_protection_insurer', value)}
                          >
                            <SelectTrigger className={`rounded-lg text-sm ${data.client_has_income_protection && isFieldInvalid(data.client_income_protection_insurer) ? 'border-red-500 bg-red-50' : ''}`}>
                              <SelectValue placeholder="Изберете" />
                            </SelectTrigger>
                            <SelectContent>
                              {INSURANCE_COMPANIES.map(ins => (
                                <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1" data-invalid={data.client_has_income_protection && isFieldInvalid(data.client_income_protection_date) ? "true" : undefined}>
                          <Label className="text-xs text-slate-500">Дата на сключване <span className="text-red-500">*</span></Label>
                          <BulgarianDateInput
                            value={data.client_income_protection_date || ''}
                            onChange={(value) => onChange('client_income_protection_date', value)}
                            className={`rounded-lg text-sm ${data.client_has_income_protection && isFieldInvalid(data.client_income_protection_date) ? 'border-red-500 bg-red-50' : ''}`}
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Human Capital Message - only if income is not from rent or investments */}
                    {data.income_source && data.income_source !== 'rent' && data.income_source !== 'investments' && (() => {
                      const clientAge = data.client_age || 0;
                      const clientRetirementAge = data.client_retirement_age || 65;
                      const clientYearsToRetirement = Math.max(0, clientRetirementAge - clientAge);
                      
                      // Calculate human capital with 3% annual increase
                      let clientHumanCapital = 0;
                      let currentIncome = (clientNetIncome || 0) * 12;
                      for (let i = 0; i < clientYearsToRetirement; i++) {
                        clientHumanCapital += currentIncome;
                        currentIncome *= 1.03;
                      }
                      
                      return clientHumanCapital > 0 ? (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-amber-800">
                            <span className="font-bold">Вашият трудов капитал е {Math.round(clientHumanCapital).toLocaleString('bg-BG')} €.</span> Вашите доходи са пряко свързани със способността Ви да работите. Съветваме Ви да обмислите защита на Вашия доход!
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Partner Column */}
              {includePartner && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700">Партньор</span>
                  </div>
                  <div className="space-y-4">
                    {/* Layoff */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Съкращение</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_risk_layoff ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_risk_layoff', !(data.partner_risk_layoff ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_risk_layoff ?? false) ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_risk_layoff ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_risk_layoff ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_risk_layoff && (() => {
                        const compensation = calculateLayoffCompensation(partnerGrossIncome);
                        const missing = Math.max(0, partnerNetIncome - compensation);
                        return (
                          <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                              <Input
                                type="number"
                                value={compensation}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                              <Input
                                type="number"
                                value={missing}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, partnerNetIncome))}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Maternity */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Отпуск по майчинство</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_risk_maternity ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_risk_maternity', !(data.partner_risk_maternity ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_risk_maternity ?? false) ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_risk_maternity ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_risk_maternity ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_risk_maternity && (() => {
                        const compYear1 = calculateMaternityYear1(partnerGrossIncome);
                        const missingYear1 = Math.max(0, partnerNetIncome - compYear1);
                        const missingYear2 = Math.max(0, partnerNetIncome - maternityYear2);
                        return (
                          <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 1-ва год. (€)</Label>
                              <Input
                                type="number"
                                value={compYear1}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 1-ва год. (€)</Label>
                              <Input
                                type="number"
                                value={missingYear1}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear1, partnerNetIncome))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500 h-8 flex items-end">Обезщетение 2-ра год. (€)</Label>
                              <Input
                                type="number"
                                value={maternityYear2}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500 h-8 flex items-end">Липсващ доход 2-ра год. (€)</Label>
                              <Input
                                type="number"
                                value={missingYear2}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missingYear2, partnerNetIncome))}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Sick Leave */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Болнични</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_risk_sick_leave ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_risk_sick_leave', !(data.partner_risk_sick_leave ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_risk_sick_leave ?? false) ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_risk_sick_leave ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_risk_sick_leave ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_risk_sick_leave && (() => {
                        const compensation = calculateSickLeaveCompensation(partnerGrossIncome);
                        const missing = Math.max(0, partnerNetIncome - compensation);
                        return (
                          <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                              <Input
                                type="number"
                                value={compensation}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                              <Input
                                type="number"
                                value={missing}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, partnerNetIncome))}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Disability */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Инвалидност</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_risk_disability ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_risk_disability', !(data.partner_risk_disability ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_risk_disability ?? false) ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_risk_disability ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_risk_disability ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_risk_disability && (() => {
                        const compensation = calculateDisabilityCompensation(partnerGrossIncome);
                        const missing = Math.max(0, partnerNetIncome - compensation);
                        return (
                          <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                              <Input
                                type="number"
                                value={compensation}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                              <Input
                                type="number"
                                value={missing}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, partnerNetIncome))}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Death */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Смърт</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_risk_death ?? false) ? "text-green-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_risk_death', !(data.partner_risk_death ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_risk_death ?? false) ? "bg-red-500" : "bg-green-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_risk_death ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_risk_death ?? false) ? "text-red-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_risk_death && (() => {
                        const compensation = calculateDeathCompensation(partnerGrossIncome);
                        const missing = Math.max(0, partnerNetIncome - compensation);
                        return (
                          <div className="ml-4 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Обезщетение (€)</Label>
                              <Input
                                type="number"
                                value={compensation}
                                readOnly
                                className="rounded-lg bg-slate-100 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-slate-500">Липсващ доход (€)</Label>
                              <Input
                                type="number"
                                value={missing}
                                readOnly
                                className={cn("rounded-lg text-sm", getMissingIncomeColor(missing, partnerNetIncome))}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Partner Income Protection */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="cursor-pointer">Подсигурени ли са Вашите доходи?</Label>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-medium", !(data.partner_has_income_protection ?? false) ? "text-red-600" : "text-slate-400")}>не</span>
                          <button
                            type="button"
                            onClick={() => onChange('partner_has_income_protection', !(data.partner_has_income_protection ?? false))}
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              (data.partner_has_income_protection ?? false) ? "bg-green-500" : "bg-red-500"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                              (data.partner_has_income_protection ?? false) ? "left-6" : "left-0.5"
                            )} />
                          </button>
                          <span className={cn("text-sm font-medium", (data.partner_has_income_protection ?? false) ? "text-green-600" : "text-slate-400")}>да</span>
                        </div>
                      </div>
                      {data.partner_has_income_protection && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1" data-invalid={data.partner_has_income_protection && isFieldInvalid(data.partner_income_protection_insurer) ? "true" : undefined}>
                            <Label className="text-xs text-slate-500">Застраховател <span className="text-red-500">*</span></Label>
                            <Select 
                              value={data.partner_income_protection_insurer || ''} 
                              onValueChange={(value) => onChange('partner_income_protection_insurer', value)}
                            >
                              <SelectTrigger className={`rounded-lg text-sm ${data.partner_has_income_protection && isFieldInvalid(data.partner_income_protection_insurer) ? 'border-red-500 bg-red-50' : ''}`}>
                                <SelectValue placeholder="Изберете" />
                              </SelectTrigger>
                              <SelectContent>
                                {INSURANCE_COMPANIES.map(ins => (
                                  <SelectItem key={ins.value} value={ins.value}>{ins.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1" data-invalid={data.partner_has_income_protection && isFieldInvalid(data.partner_income_protection_date) ? "true" : undefined}>
                            <Label className="text-xs text-slate-500">Дата на сключване <span className="text-red-500">*</span></Label>
                            <BulgarianDateInput
                              value={data.partner_income_protection_date || ''}
                              onChange={(value) => onChange('partner_income_protection_date', value)}
                              className={`rounded-lg text-sm ${data.partner_has_income_protection && isFieldInvalid(data.partner_income_protection_date) ? 'border-red-500 bg-red-50' : ''}`}
                              required
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Human Capital Message for Partner - only if income is not from rent or investments */}
                      {data.income_source && data.income_source !== 'rent' && data.income_source !== 'investments' && (() => {
                        const partnerAge = data.partner_age || 0;
                        const partnerRetirementAge = data.partner_retirement_age || 65;
                        const partnerYearsToRetirement = Math.max(0, partnerRetirementAge - partnerAge);
                        
                        // Calculate human capital with 3% annual increase
                        let partnerHumanCapital = 0;
                        let currentIncome = (partnerNetIncome || 0) * 12;
                        for (let i = 0; i < partnerYearsToRetirement; i++) {
                          partnerHumanCapital += currentIncome;
                          currentIncome *= 1.03;
                        }
                        
                        return partnerHumanCapital > 0 ? (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-800">
                              <span className="font-bold">Вашият трудов капитал е {Math.round(partnerHumanCapital).toLocaleString('bg-BG')} €.</span> Вашите доходи са пряко свързани със способността Ви да работите. Съветваме Ви да обмислите защита на Вашия доход!
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Include income protection in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_income_protection_in_plan || false}
          onCheckedChange={(checked) => onChange('include_income_protection_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}