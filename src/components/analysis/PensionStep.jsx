import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Umbrella, User, Users } from 'lucide-react';

export default function PensionStep({ data, onChange }) {
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
                <Label>От каква месечна пенсия ще се нуждаете? (лв)</Label>
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
                <Label>Очаквана държавна пенсия (лв)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="800"
                  value={data.client_expected_state_pension || ''}
                  onChange={(e) => onChange('client_expected_state_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  Разлика: <span className="font-semibold">
                    {((data.client_desired_pension || 0) - (data.client_expected_state_pension || 0)).toLocaleString()} лв
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
                <Label>От каква месечна пенсия ще се нуждаете? (лв)</Label>
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
                <Label>Очаквана държавна пенсия (лв)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="800"
                  value={data.partner_expected_state_pension || ''}
                  onChange={(e) => onChange('partner_expected_state_pension', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  Разлика: <span className="font-semibold">
                    {((data.partner_desired_pension || 0) - (data.partner_expected_state_pension || 0)).toLocaleString()} лв
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

      {/* Tax Bonus */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Данъчен бонус</h3>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Клиент - Доброволно пенсионно осигуряване</Label>
            <Switch
              checked={data.client_voluntary_pension || false}
              onCheckedChange={(checked) => onChange('client_voluntary_pension', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Партньор - Доброволно пенсионно осигуряване</Label>
            <Switch
              checked={data.partner_voluntary_pension || false}
              onCheckedChange={(checked) => onChange('partner_voluntary_pension', checked)}
            />
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