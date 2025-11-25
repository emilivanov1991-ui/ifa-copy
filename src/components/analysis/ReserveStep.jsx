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
import { PiggyBank, User, Users, TrendingUp, Shield, Scale, Zap, Flame } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ReserveStep({ data, onChange }) {
  // Get total monthly income from input
  const totalMonthlyIncome = data.total_monthly_income || 0;

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
      {/* Savings Method */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PiggyBank className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">По какъв начин създавате своя финансов резерв?</h3>
        </div>

        {/* Monthly Net Income */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-4">Месечен среден нетен доход</h4>
          <div className={data.include_partner ? "grid sm:grid-cols-2 gap-4" : ""}>
            <div className="space-y-2">
              <Label className="text-sm">Клиент (€)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={data.client_monthly_net_income || ''}
                onChange={(e) => {
                  const clientIncome = parseInt(e.target.value) || 0;
                  onChange('client_monthly_net_income', clientIncome);
                  onChange('total_monthly_income', clientIncome + (data.partner_monthly_net_income || 0));
                }}
                className="rounded-lg"
              />
            </div>
            {data.include_partner && (
              <div className="space-y-2">
                <Label className="text-sm">Партньор (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.partner_monthly_net_income || ''}
                  onChange={(e) => {
                    const partnerIncome = parseInt(e.target.value) || 0;
                    onChange('partner_monthly_net_income', partnerIncome);
                    onChange('total_monthly_income', (data.client_monthly_net_income || 0) + partnerIncome);
                  }}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">Общо:</span>
            <span className="font-semibold text-blue-600">{(data.total_monthly_income || 0).toLocaleString('bg-BG')} €</span>
          </div>
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

          {totalMonthlyIncome > 0 && (() => {
            const clientLiquid = (data.client_checking_account || 0) + (data.client_savings_account || 0) + 
              (data.client_term_deposit || 0) + (data.client_cash || 0);
            const partnerLiquid = data.include_partner ? ((data.partner_checking_account || 0) + (data.partner_savings_account || 0) + 
              (data.partner_term_deposit || 0) + (data.partner_cash || 0)) : 0;
            const totalLiquid = clientLiquid + partnerLiquid;
            const recommendedReserve = recommendedMax;

            return (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-700 font-medium">Препоръчителният резерв за Вас е: </span>
                  <span className="text-blue-800 font-bold">
                    {recommendedMin === recommendedMax 
                      ? `${recommendedMin.toLocaleString('bg-BG')} €`
                      : `${recommendedMin.toLocaleString('bg-BG')} € - ${recommendedMax.toLocaleString('bg-BG')} €`
                    }
                  </span>
                </div>

                {totalLiquid > recommendedReserve && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">
                      Спестяванията ви надвишават препоръчителния резерв и губите средно <span className="font-bold">{Math.round((totalLiquid - recommendedReserve) * 0.05).toLocaleString('bg-BG')} €</span> годишно от инфлация. Ще ви помогнем да реализирате доходност на тези средства!
                    </p>
                  </div>
                )}

                {totalLiquid < recommendedReserve && totalLiquid > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">
                      Спестяванията ви са по-малко от препоръчителния резерв с <span className="font-bold">{(recommendedReserve - totalLiquid).toLocaleString('bg-BG')} €</span>. Ще ви помогнем да достигнете до него чрез правилно финансово планиране!
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Risk Profile */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Рисков профил</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Разпределете инвестицията в % според отделните инструменти (общо 100%)</Label>
            
            {/* Visual Risk Profile Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
              {/* Conservative */}
              <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Консервативен</span>
                </div>
                <div className="text-xs text-blue-600 mb-2">+2% годишно</div>
                <div className="h-2 bg-blue-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(data.conservative_percent || 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.conservative_percent || ''}
                  onChange={(e) => onChange('conservative_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-full text-center"
                />
              </div>

              {/* Balanced */}
              <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Балансиран</span>
                </div>
                <div className="text-xs text-green-600 mb-2">+7% / -3%</div>
                <div className="h-2 bg-green-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-green-600 rounded-full transition-all"
                    style={{ width: `${Math.min(data.moderate_percent || 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.moderate_percent || ''}
                  onChange={(e) => onChange('moderate_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-full text-center"
                />
              </div>

              {/* Dynamic */}
              <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-800">Динамичен</span>
                </div>
                <div className="text-xs text-amber-600 mb-2">+12% / -5%</div>
                <div className="h-2 bg-amber-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${Math.min(data.dynamic_percent || 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.dynamic_percent || ''}
                  onChange={(e) => onChange('dynamic_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-full text-center"
                />
              </div>

              {/* Aggressive */}
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Агресивен</span>
                </div>
                <div className="text-xs text-red-600 mb-2">+25% / -15%</div>
                <div className="h-2 bg-red-200 rounded-full mb-3">
                  <div 
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: `${Math.min(data.aggressive_percent || 0, 100)}%` }}
                  />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={data.aggressive_percent || ''}
                  onChange={(e) => onChange('aggressive_percent', parseInt(e.target.value) || '')}
                  className="rounded-lg w-full text-center"
                />
              </div>
            </div>

            {/* Diversification Messages */}
            {(() => {
              const cons = data.conservative_percent || 0;
              const mod = data.moderate_percent || 0;
              const dyn = data.dynamic_percent || 0;
              const agg = data.aggressive_percent || 0;
              const total = cons + mod + dyn + agg;
              
              // Only show messages if all 4 fields are filled
              const allFilled = data.conservative_percent !== undefined && data.conservative_percent !== '' &&
                               data.moderate_percent !== undefined && data.moderate_percent !== '' &&
                               data.dynamic_percent !== undefined && data.dynamic_percent !== '' &&
                               data.aggressive_percent !== undefined && data.aggressive_percent !== '';
              
              if (allFilled) {
                if (total !== 100) {
                  return (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-700">
                        Моля разпределете активите така, че общия сбор да прави 100%
                      </p>
                    </div>
                  );
                }
                
                const hasOver80 = cons > 80 || mod > 80 || dyn > 80 || agg > 80;
                
                if (hasOver80) {
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">
                        Прекалената концентрация в един вид активи води до по-голяма волатилност и риск! Препоръчваме Ви по-широка диверсификация!
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700">
                        Поздравления! Явно правилно разбирате идеята за диверсификация на Вашите активи!
                      </p>
                    </div>
                  );
                }
              }
              return null;
            })()}
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

      {/* Investment Referrals */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Кои от Вашите близки или познати:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Have savings but no investments */}
          <div className="space-y-3">
            <Label className="text-slate-700">Имат спестявания, но не са предприели инвестиционни решения?</Label>
            {(data.referrals_have_savings || ['']).map((name, index) => {
              // Check if name exists in housing or birthday referrals
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`savings_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.referrals_have_savings || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('referrals_have_savings', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходната тема. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invest regularly or interested */}
          <div className="space-y-3">
            <Label className="text-slate-700">Инвестират редовно или се интересуват от инвестиции?</Label>
            {(data.referrals_invest_regularly || ['']).map((name, index) => {
              // Check if name exists in housing or birthday referrals
              const existingNames = [
                ...(data.referrals_no_own_home || []),
                ...(data.referrals_own_home_long || []),
                ...(data.birthday_family_names || []),
                ...(data.birthday_friends_names || []),
                ...(data.birthday_colleagues_names || [])
              ].filter(n => n && n.trim());
              const isDuplicate = name && name.trim() && existingNames.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
              
              return (
                <div key={`invest_${index}`}>
                  <Input
                    placeholder="Име на познат"
                    value={name}
                    onChange={(e) => {
                      const newList = [...(data.referrals_invest_regularly || [''])];
                      newList[index] = e.target.value;
                      if (index === newList.length - 1 && e.target.value) {
                        newList.push('');
                      }
                      onChange('referrals_invest_regularly', newList);
                    }}
                    className={cn("rounded-lg", isDuplicate && "border-amber-500")}
                  />
                  {isDuplicate && (
                    <p className="text-amber-600 text-sm mt-1">
                      Това име бе предоставено на предходната тема. С кого бихме могли да го заменим?
                    </p>
                  )}
                </div>
              );
            })}
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