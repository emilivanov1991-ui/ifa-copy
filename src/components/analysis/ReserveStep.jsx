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
import { PiggyBank, User, Users, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ReserveStep({ data, onChange }) {
  return (
    <div className="space-y-8">
      {/* Current Savings */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">По какъв начин създавате своя финансов резерв?</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент (лв)</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Разплащателна сметка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_checking_account || ''}
                  onChange={(e) => onChange('client_checking_account', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Спестовна книжка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_savings_book || ''}
                  onChange={(e) => onChange('client_savings_book', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Срочен депозит</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_term_deposit || ''}
                  onChange={(e) => onChange('client_term_deposit', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Взаимни фондове</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_mutual_funds || ''}
                  onChange={(e) => onChange('client_mutual_funds', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Спестовна сметка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_savings_account || ''}
                  onChange={(e) => onChange('client_savings_account', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Пари в брой</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_cash || ''}
                  onChange={(e) => onChange('client_cash', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
            </div>
          </div>

          {/* Partner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Партньор (лв)</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Разплащателна сметка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_checking_account || ''}
                  onChange={(e) => onChange('partner_checking_account', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Спестовна книжка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_savings_book || ''}
                  onChange={(e) => onChange('partner_savings_book', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Срочен депозит</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_term_deposit || ''}
                  onChange={(e) => onChange('partner_term_deposit', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Взаимни фондове</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_mutual_funds || ''}
                  onChange={(e) => onChange('partner_mutual_funds', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Спестовна сметка</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_savings_account || ''}
                  onChange={(e) => onChange('partner_savings_account', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Пари в брой</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_cash || ''}
                  onChange={(e) => onChange('partner_cash', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Size */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Какъв размер на резерва е достатъчен според Вас?</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Защитен резерв (брой месечни доходи)</Label>
            <Select 
              value={data.desired_reserve_months?.toString() || ''} 
              onValueChange={(value) => onChange('desired_reserve_months', parseInt(value))}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 месеца</SelectItem>
                <SelectItem value="6">6 месеца (препоръчително)</SelectItem>
                <SelectItem value="9">9 месеца</SelectItem>
                <SelectItem value="12">12 месеца</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Интересувате ли се от по-добра възможност за създаване на резерв?</Label>
            <Switch
              checked={data.interest_in_better_savings || false}
              onCheckedChange={(checked) => onChange('interest_in_better_savings', checked)}
            />
          </div>
        </div>
      </div>

      {/* Risk Profile */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Рисков профил</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Разпределете инвестицията в % според отделните инструменти (общо 100%)</Label>
            <div className="grid sm:grid-cols-2 gap-4 mt-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Консервативен (+2%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.conservative_percent || ''}
                  onChange={(e) => onChange('conservative_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Смел (+7%/-3%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.moderate_percent || ''}
                  onChange={(e) => onChange('moderate_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Динамичен (+12%/-5%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.dynamic_percent || ''}
                  onChange={(e) => onChange('dynamic_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Агресивен (+25%/-15%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.aggressive_percent || ''}
                  onChange={(e) => onChange('aggressive_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-24"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Инвестиционен хоризонт</Label>
            <Select 
              value={data.investment_horizon || ''} 
              onValueChange={(value) => onChange('investment_horizon', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up_to_1_year">До 1 година</SelectItem>
                <SelectItem value="up_to_5_years">До 5 години</SelectItem>
                <SelectItem value="up_to_7_years">До 7 години</SelectItem>
                <SelectItem value="over_7_years">Над 7 години</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Какъв е Вашият опит с инвестирането?</Label>
            <Select 
              value={data.investment_experience || ''} 
              onValueChange={(value) => onChange('investment_experience', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Нямам опит</SelectItem>
                <SelectItem value="basic">Основен (спестовни сметки, депозити)</SelectItem>
                <SelectItem value="intermediate">Среден (взаимни фондове, облигации)</SelectItem>
                <SelectItem value="advanced">Напреднал (акции, структурирани продукти)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Какво бихте направили, ако стойността на инвестицията падне с 10%?</Label>
            <Select 
              value={data.reaction_to_10_percent_drop || ''} 
              onValueChange={(value) => onChange('reaction_to_10_percent_drop', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell_all">Продавам всичко</SelectItem>
                <SelectItem value="sell_part">Продавам част</SelectItem>
                <SelectItem value="hold">Изчаквам</SelectItem>
                <SelectItem value="buy_more">Купувам още</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Какво бихте направили, ако инвестицията нарасне с 20%?</Label>
            <Select 
              value={data.reaction_to_20_percent_gain || ''} 
              onValueChange={(value) => onChange('reaction_to_20_percent_gain', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell_all">Продавам всичко</SelectItem>
                <SelectItem value="sell_part">Продавам част</SelectItem>
                <SelectItem value="hold">Задържам</SelectItem>
                <SelectItem value="buy_more">Купувам още</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Include in plan */}
      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer">
        <Checkbox
          checked={data.include_reserve_in_plan || false}
          onCheckedChange={(checked) => onChange('include_reserve_in_plan', checked)}
        />
        <span className="font-medium text-blue-800">Да бъде включено във финансовия план</span>
      </label>
    </div>
  );
}