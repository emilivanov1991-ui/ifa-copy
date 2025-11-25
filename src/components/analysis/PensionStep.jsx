import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Umbrella, User, Users } from 'lucide-react';
import { cn } from "@/lib/utils";

// Calculate expected state pension based on category, age and gross income
const calculateStatePension = (category, retirementAge, grossIncome) => {
  const minAge = category === 'first' ? 55 : category === 'second' ? 60 : 65;
  
  if (!retirementAge || retirementAge < minAge) {
    return { amount: 67, isSocialPension: true };
  }
  
  // 45% of gross income, min 347, max 1739
  const calculated = Math.round((grossIncome || 0) * 0.45);
  const amount = Math.max(347, Math.min(1739, calculated));
  return { amount: calculated > 0 ? amount : 0, isSocialPension: false };
};

export default function PensionStep({ data, onChange }) {
  // Auto-calculate client expected pension
  useEffect(() => {
    const result = calculateStatePension(
      data.client_work_category || 'third',
      data.client_retirement_age,
      data.client_gross_income_pension
    );
    if (data.client_retirement_age && data.client_gross_income_pension) {
      onChange('client_expected_state_pension', result.amount);
      onChange('client_pension_is_social', result.isSocialPension);
    }
  }, [data.client_work_category, data.client_retirement_age, data.client_gross_income_pension]);

  // Auto-calculate partner expected pension
  useEffect(() => {
    const result = calculateStatePension(
      data.partner_work_category || 'third',
      data.partner_retirement_age,
      data.partner_gross_income_pension
    );
    if (data.partner_retirement_age && data.partner_gross_income_pension) {
      onChange('partner_expected_state_pension', result.amount);
      onChange('partner_pension_is_social', result.isSocialPension);
    }
  }, [data.partner_work_category, data.partner_retirement_age, data.partner_gross_income_pension]);

  const categoryOptions = [
    { value: 'third', label: 'Трета категория' },
    { value: 'second', label: 'Втора категория' },
    { value: 'first', label: 'Първа категория' },
  ];

  return (
    <div className="space-y-8">
      {/* Retirement Age & Pension */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Umbrella className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">По-добра пенсия</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент</span>
            </div>
            <div className="space-y-4">
              {/* Work Category */}
              <div className="space-y-2">
                <Label>Категория труд</Label>
                <div className="flex gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange('client_work_category', option.value)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                        (data.client_work_category || 'third') === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gross Income */}
              <div className="space-y-2">
                <Label>Брутен доход (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000"
                  value={data.client_gross_income_pension || ''}
                  onChange={(e) => onChange('client_gross_income_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Кога искате да излезете в пенсия? (възраст)</Label>
                <Input
                  type="number"
                  min="50"
                  max="75"
                  placeholder="65"
                  value={data.client_retirement_age || ''}
                  onChange={(e) => onChange('client_retirement_age', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>От каква месечна пенсия ще се нуждаете? (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000"
                  value={data.client_desired_pension || ''}
                  onChange={(e) => onChange('client_desired_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Очаквана държавна пенсия (€) - автоматично</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.client_expected_state_pension || ''}
                  readOnly
                  className="rounded-lg bg-slate-100"
                />
                {data.client_pension_is_social && (
                  <p className="text-amber-600 text-sm">
                    Калкулирана е социалната пенсия за страната поради липса на необходима пенсионна възраст
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  Разлика: <span className="font-semibold">
                    {((data.client_desired_pension || 0) - (data.client_expected_state_pension || 0)).toLocaleString()} €
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Partner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Партньор</span>
            </div>
            <div className="space-y-4">
              {/* Work Category */}
              <div className="space-y-2">
                <Label>Категория труд</Label>
                <div className="flex gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange('partner_work_category', option.value)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                        (data.partner_work_category || 'third') === option.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gross Income */}
              <div className="space-y-2">
                <Label>Брутен доход (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000"
                  value={data.partner_gross_income_pension || ''}
                  onChange={(e) => onChange('partner_gross_income_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Кога искате да излезете в пенсия? (възраст)</Label>
                <Input
                  type="number"
                  min="50"
                  max="75"
                  placeholder="65"
                  value={data.partner_retirement_age || ''}
                  onChange={(e) => onChange('partner_retirement_age', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>От каква месечна пенсия ще се нуждаете? (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000"
                  value={data.partner_desired_pension || ''}
                  onChange={(e) => onChange('partner_desired_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Очаквана държавна пенсия (€) - автоматично</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.partner_expected_state_pension || ''}
                  readOnly
                  className="rounded-lg bg-slate-100"
                />
                {data.partner_pension_is_social && (
                  <p className="text-amber-600 text-sm">
                    Калкулирана е социалната пенсия за страната поради липса на необходима пенсионна възраст
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  Разлика: <span className="font-semibold">
                    {((data.partner_desired_pension || 0) - (data.partner_expected_state_pension || 0)).toLocaleString()} €
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pension Pillars */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Какво сте направили до сега?</h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">I. Стълб (държавно осигуряване)</Label>
                <Switch
                  checked={data.client_pillar_1 || false}
                  onCheckedChange={(checked) => onChange('client_pillar_1', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">II. Стълб (допълнително задължително)</Label>
                <Switch
                  checked={data.client_pillar_2 || false}
                  onCheckedChange={(checked) => onChange('client_pillar_2', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">III. Стълб (доброволно осигуряване)</Label>
                <Switch
                  checked={data.client_pillar_3 || false}
                  onCheckedChange={(checked) => onChange('client_pillar_3', checked)}
                />
              </div>
            </div>
          </div>

          {/* Partner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Партньор</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">I. Стълб (държавно осигуряване)</Label>
                <Switch
                  checked={data.partner_pillar_1 || false}
                  onCheckedChange={(checked) => onChange('partner_pillar_1', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">II. Стълб (допълнително задължително)</Label>
                <Switch
                  checked={data.partner_pillar_2 || false}
                  onCheckedChange={(checked) => onChange('partner_pillar_2', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">III. Стълб (доброволно осигуряване)</Label>
                <Switch
                  checked={data.partner_pillar_3 || false}
                  onCheckedChange={(checked) => onChange('partner_pillar_3', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Include in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_pension_in_plan || false}
          onCheckedChange={(checked) => onChange('include_pension_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}