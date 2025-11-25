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
  // Calculate total monthly income
  const clientMonthlyIncome = (data.client_net_income || 0) + (data.client_other_monthly_income || 0);
  const partnerMonthlyIncome = data.include_partner ? ((data.partner_net_income || 0) + (data.partner_other_monthly_income || 0)) : 0;
  const totalMonthlyIncome = clientMonthlyIncome + partnerMonthlyIncome;

  // Calculate monthly expenses (income - savings)
  const monthlySavings = data.monthly_savings_amount || 0;
  const monthlyExpenses = totalMonthlyIncome - monthlySavings;

  // Calculate total savings
  const clientTotal = (data.client_checking_account || 0) + (data.client_term_deposit || 0) + 
    (data.client_mutual_funds || 0) + (data.client_savings_account || 0) + (data.client_cash || 0) +
    (data.client_crypto || 0) + (data.client_gold || 0);
  const partnerTotal = data.include_partner ? ((data.partner_checking_account || 0) + (data.partner_term_deposit || 0) + 
    (data.partner_mutual_funds || 0) + (data.partner_savings_account || 0) + (data.partner_cash || 0) +
    (data.partner_crypto || 0) + (data.partner_gold || 0)) : 0;
  const grandTotal = clientTotal + partnerTotal;

  // Recommended reserve range (6 months expenses to 6 months income)
  const recommendedMin = Math.round(monthlyExpenses * 6);
  const recommendedMax = Math.round(totalMonthlyIncome * 6);

  return (
    <div className="space-y-8">
      {/* Total Monthly Income */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Общи средни месечни доходи:</h3>
        <div className="text-2xl font-bold text-blue-600">
          {totalMonthlyIncome.toLocaleString('bg-BG')} €
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {data.include_partner ? `Клиент: ${clientMonthlyIncome.toLocaleString('bg-BG')} € + Партньор: ${partnerMonthlyIncome.toLocaleString('bg-BG')} €` : `Клиент: ${clientMonthlyIncome.toLocaleString('bg-BG')} €`}
        </div>
      </div>

      {/* Savings Method */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">По какъв начин създавате своя финансов резерв?</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Метод на спестяване</Label>
            <Select 
              value={data.savings_method || ''} 
              onValueChange={(value) => onChange('savings_method', value)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не спестявам</SelectItem>
                <SelectItem value="leftover">Каквото остане след разходи</SelectItem>
                <SelectItem value="fixed">Спестявам в началото на месеца фиксирана сума</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.savings_method === 'leftover' || data.savings_method === 'fixed') && (
            <div className="space-y-2">
              <Label>Приблизително спестяване месечно (€)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.monthly_savings_amount || ''}
                onChange={(e) => onChange('monthly_savings_amount', parseInt(e.target.value) || '')}
                className="rounded-lg w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Current Savings and Investments */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Текущи спестявания и инвестиции</h3>

        <div className={data.include_partner ? "grid lg:grid-cols-2 gap-8" : ""}>
          {/* Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">Клиент (€)</span>
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
                <Label className="text-sm">Взаимни фондове, акции, облигации и др.</Label>
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
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Криптовалути</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_crypto || ''}
                  onChange={(e) => onChange('client_crypto', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm">Злато и др.</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.client_gold || ''}
                  onChange={(e) => onChange('client_gold', parseInt(e.target.value) || '')}
                  className="rounded-lg w-32"
                />
              </div>
            </div>
          </div>

          {/* Partner - only show if included */}
          {data.include_partner && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Партньор (€)</span>
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
                  <Label className="text-sm">Взаимни фондове, акции, облигации и др.</Label>
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
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Криптовалути</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_crypto || ''}
                    onChange={(e) => onChange('partner_crypto', parseInt(e.target.value) || '')}
                    className="rounded-lg w-32"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Злато и др.</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={data.partner_gold || ''}
                    onChange={(e) => onChange('partner_gold', parseInt(e.target.value) || '')}
                    className="rounded-lg w-32"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Общ сбор на спестявания и инвестиции:</span>
            <span className="text-2xl font-bold text-blue-600">{grandTotal.toLocaleString('bg-BG')} €</span>
          </div>
        </div>
      </div>

      {/* Reserve Size */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Какъв размер на резерва е достатъчен според Вас?</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Желан размер на резерва (€)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.desired_reserve_amount || ''}
              onChange={(e) => onChange('desired_reserve_amount', parseInt(e.target.value) || '')}
              className="rounded-lg w-48"
            />
          </div>

          {data.desired_reserve_amount > 0 && totalMonthlyIncome > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-700 font-medium">Препоръчителният резерв за Вас е: </span>
              <span className="text-blue-800 font-bold">
                {recommendedMin.toLocaleString('bg-BG')} € - {recommendedMax.toLocaleString('bg-BG')} €
              </span>
              <p className="text-blue-600 text-sm mt-1">
                (между 6 месечни разходи и 6 месечни доходи)
              </p>
            </div>
          )}
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