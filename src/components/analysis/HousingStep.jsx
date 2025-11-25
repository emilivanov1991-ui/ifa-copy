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
import { Home, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function HousingStep({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* Current Situation */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Home className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Сегашна ситуация</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Текущо жилище</Label>
            <Select 
              value={data.current_housing || ''} 
              onValueChange={(value) => onChange('current_housing', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rented">Наето жилище</SelectItem>
                <SelectItem value="subrented">Пренаето жилище</SelectItem>
                <SelectItem value="with_parents">При родители</SelectItem>
                <SelectItem value="owned">Собствено жилище</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location field for rented/subrented/with_parents */}
          {(data.current_housing === 'rented' || data.current_housing === 'subrented' || data.current_housing === 'with_parents') && (
            <div className="space-y-2">
              <Label>Локация</Label>
              <Input
                placeholder="гр. София, кв. Лозенец"
                value={data.current_housing_location || ''}
                onChange={(e) => onChange('current_housing_location', e.target.value)}
                className="rounded-lg"
              />
            </div>
          )}

          <div className={cn("grid gap-4", data.current_housing === 'with_parents' ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
            <div className="space-y-2">
              <Label>Брой стаи</Label>
              <Input
                type="number"
                min="1"
                max="20"
                placeholder="3"
                value={data.current_housing_rooms || ''}
                onChange={(e) => onChange('current_housing_rooms', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Застроена площ (кв.м)</Label>
              <Input
                type="number"
                min="10"
                placeholder="80"
                value={data.current_housing_area || ''}
                onChange={(e) => onChange('current_housing_area', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            {data.current_housing !== 'with_parents' && (
              <div className="space-y-2">
                <Label>Стойност (лв)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="150000"
                  value={data.current_housing_value || ''}
                  onChange={(e) => onChange('current_housing_value', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Mortgage section for owned housing */}
          {data.current_housing === 'owned' && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="cursor-pointer">Има ли ипотека?</Label>
                <Switch
                  checked={data.current_housing_has_mortgage || false}
                  onCheckedChange={(checked) => onChange('current_housing_has_mortgage', checked)}
                />
              </div>

              {data.current_housing_has_mortgage && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-2">
                    <Label>Остатъчна сума (лв)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={data.current_mortgage_remaining || ''}
                      onChange={(e) => onChange('current_mortgage_remaining', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лихвен процент (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="3.5"
                      value={data.current_mortgage_interest_rate || ''}
                      onChange={(e) => onChange('current_mortgage_interest_rate', parseFloat(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Банка</Label>
                    <Input
                      placeholder="УниКредит Булбанк"
                      value={data.current_mortgage_bank || ''}
                      onChange={(e) => onChange('current_mortgage_bank', e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Оставащ период (години)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="35"
                      placeholder="15"
                      value={data.current_mortgage_remaining_years || ''}
                      onChange={(e) => onChange('current_mortgage_remaining_years', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месечна вноска (лв)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="800"
                      value={data.current_mortgage_monthly_payment || ''}
                      onChange={(e) => onChange('current_mortgage_monthly_payment', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Planning Change */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Планирате ли промяна?</h3>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Label className="cursor-pointer">Планирам промяна</Label>
          <Switch
            checked={data.planning_housing_change || false}
            onCheckedChange={(checked) => onChange('planning_housing_change', checked)}
          />
        </div>

        {data.planning_housing_change && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Вид на промяната</Label>
              <Select 
                value={data.planned_housing_type || ''} 
                onValueChange={(value) => onChange('planned_housing_type', value)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Покупка - Апартамент</SelectItem>
                  <SelectItem value="house">Покупка и строителство - Къща</SelectItem>
                  <SelectItem value="reconstruction">Реконструкция</SelectItem>
                  <SelectItem value="optimization">Оптимизация</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Брой стаи</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="4"
                  value={data.planned_housing_rooms || ''}
                  onChange={(e) => onChange('planned_housing_rooms', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Застроена площ (кв.м)</Label>
                <Input
                  type="number"
                  min="10"
                  placeholder="100"
                  value={data.planned_housing_area || ''}
                  onChange={(e) => onChange('planned_housing_area', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Стойност на имота (лв)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="200000"
                  value={data.planned_housing_value || ''}
                  onChange={(e) => onChange('planned_housing_value', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Времеви хоризонт (години)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="5"
                  value={data.planned_housing_timeline_years || ''}
                  onChange={(e) => onChange('planned_housing_timeline_years', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Общи разходи (лв)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="30000"
                  value={data.planned_housing_extra_costs || ''}
                  onChange={(e) => onChange('planned_housing_extra_costs', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financing */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Начин на финансиране</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Метод на финансиране</Label>
            <Select 
              value={data.financing_method || ''} 
              onValueChange={(value) => onChange('financing_method', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Пари в брой</SelectItem>
                <SelectItem value="loan">Заем / Кредит</SelectItem>
                <SelectItem value="cash_and_loan">Пари в брой + заем / кредит</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Наличност в брой (лв)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50000"
                value={data.available_cash || ''}
                onChange={(e) => onChange('available_cash', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Размер на заема (лв)</Label>
              <Input
                type="number"
                min="0"
                placeholder="150000"
                value={data.loan_amount || ''}
                onChange={(e) => onChange('loan_amount', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Срок на изплащане (години)</Label>
              <Input
                type="number"
                min="1"
                max="35"
                placeholder="25"
                value={data.loan_term_years || ''}
                onChange={(e) => onChange('loan_term_years', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Очаквана месечна вноска (лв)</Label>
              <Input
                type="number"
                min="0"
                placeholder="800"
                value={data.expected_monthly_payment || ''}
                onChange={(e) => onChange('expected_monthly_payment', parseInt(e.target.value) || '')}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Include in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_housing_in_plan || false}
          onCheckedChange={(checked) => onChange('include_housing_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}