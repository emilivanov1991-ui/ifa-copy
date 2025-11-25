import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Shield, Wallet, Building2, Car } from 'lucide-react';

export default function ProtectionStep({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* Property Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Защита на собствеността</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">Какво имущество притежавате?</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <Label>Апартамент (стойност в €)</Label>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.property_apartment_value || ''}
              onChange={(e) => onChange('property_apartment_value', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <Label>Къща (стойност в €)</Label>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.property_house_value || ''}
              onChange={(e) => onChange('property_house_value', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-slate-500" />
              <Label>Автомобил (стойност в €)</Label>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.property_car_value || ''}
              onChange={(e) => onChange('property_car_value', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label>Друго имущество (€)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.property_other_value || ''}
              onChange={(e) => onChange('property_other_value', parseInt(e.target.value) || '')}
              className="rounded-lg w-32"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Label className="cursor-pointer">Имате ли застраховка на имуществото?</Label>
            <Switch
              checked={data.has_property_insurance || false}
              onCheckedChange={(checked) => onChange('has_property_insurance', checked)}
            />
          </div>
        </div>
      </div>

      {/* Include property in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_property_in_plan || false}
          onCheckedChange={(checked) => onChange('include_property_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>

      {/* Income Protection */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Подсигуряване на доходите</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>От къде идват Вашите доходи?</Label>
            <Select 
              value={data.income_source || ''} 
              onValueChange={(value) => onChange('income_source', value)}
            >
              <SelectTrigger className="rounded-lg">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Съкращение</Label>
                <Switch
                  checked={data.risk_layoff || false}
                  onCheckedChange={(checked) => onChange('risk_layoff', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Отпуск по майчинство</Label>
                <Switch
                  checked={data.risk_maternity || false}
                  onCheckedChange={(checked) => onChange('risk_maternity', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Болнични</Label>
                <Switch
                  checked={data.risk_sick_leave || false}
                  onCheckedChange={(checked) => onChange('risk_sick_leave', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Инвалидност</Label>
                <Switch
                  checked={data.risk_disability || false}
                  onCheckedChange={(checked) => onChange('risk_disability', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Смърт</Label>
                <Switch
                  checked={data.risk_death || false}
                  onCheckedChange={(checked) => onChange('risk_death', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Label className="cursor-pointer">Имате ли подсигуряване на доходите?</Label>
            <Switch
              checked={data.has_income_protection || false}
              onCheckedChange={(checked) => onChange('has_income_protection', checked)}
            />
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