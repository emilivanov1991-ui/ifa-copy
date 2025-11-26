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

// Calculate monthly mortgage payment using amortization formula
const calculateMonthlyPayment = (principal, annualRate, years) => {
  if (!principal || !annualRate || !years) return '';
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  if (monthlyRate === 0) return Math.round(principal / numberOfPayments);
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return Math.round(payment);
};

// Generate interest rate options from 1% to 8% in 0.5% increments
const interestRateOptions = [];
for (let rate = 1; rate <= 8; rate += 0.5) {
  interestRateOptions.push(rate);
}

export default function HousingStep({ data, onChange }) {
  // Calculate loan amount automatically
  const plannedValue = data.planned_housing_value || 0;
  const extraCosts = data.planned_housing_extra_costs || 0;
  const availableCash = data.available_cash || 0;
  const calculatedLoanAmount = Math.max(0, plannedValue + extraCosts - availableCash);

  // Calculate monthly payment automatically
  const interestRate = data.loan_interest_rate || 3;
  const loanYears = data.loan_term_years || 0;
  const calculatedMonthlyPayment = calculateMonthlyPayment(calculatedLoanAmount, interestRate, loanYears);

  // Calculate total overpayment (interest paid over loan lifetime)
  const totalPayments = calculatedMonthlyPayment && loanYears ? calculatedMonthlyPayment * loanYears * 12 : 0;
  const totalOverpayment = totalPayments > calculatedLoanAmount ? totalPayments - calculatedLoanAmount : 0;
  
  // Calculate potential savings range (30-40% of overpayment)
  const potentialSavingsMin = Math.round(totalOverpayment * 0.30);
  const potentialSavingsMax = Math.round(totalOverpayment * 0.40);

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
                <SelectItem value="with_parents">При родители</SelectItem>
                <SelectItem value="owned">Собствено жилище</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location field for rented/with_parents */}
          {(data.current_housing === 'rented' || data.current_housing === 'with_parents') && (
            <div className="space-y-2">
              <Label>Локация <span className="text-red-500">*</span></Label>
              <Input
                value={data.current_housing_location || ''}
                onChange={(e) => onChange('current_housing_location', e.target.value)}
                className="rounded-lg"
                required
              />
            </div>
          )}

          {/* Address field for owned housing */}
          {data.current_housing === 'owned' && (
            <div className="space-y-2">
              <Label>Адрес <span className="text-red-500">*</span></Label>
              <Input
                value={data.current_housing_address || ''}
                onChange={(e) => onChange('current_housing_address', e.target.value)}
                className="rounded-lg"
                required
              />
            </div>
          )}

          <div className={cn("grid gap-4", (data.current_housing === 'with_parents' || data.current_housing === 'rented') ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
            <div className="space-y-2">
              <Label>Брой стаи <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={data.current_housing_rooms || ''}
                onChange={(e) => onChange('current_housing_rooms', parseInt(e.target.value) || '')}
                className="rounded-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Застроена площ (кв.м) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="10"
                value={data.current_housing_area || ''}
                onChange={(e) => onChange('current_housing_area', parseInt(e.target.value) || '')}
                className="rounded-lg"
                required
              />
            </div>
            {data.current_housing === 'owned' && (
              <>
                <div className="space-y-2">
                  <Label>Стойност (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.current_housing_value || ''}
                    onChange={(e) => onChange('current_housing_value', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Стойност на движимо имущество (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.current_housing_movable_value || ''}
                    onChange={(e) => onChange('current_housing_movable_value', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Mortgage section for owned housing */}
          {data.current_housing === 'owned' && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="cursor-pointer">Има ли ипотека?</Label>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", !(data.current_housing_has_mortgage ?? false) ? "text-green-600" : "text-slate-400")}>Не</span>
                  <button
                    type="button"
                    onClick={() => onChange('current_housing_has_mortgage', !(data.current_housing_has_mortgage ?? false))}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      (data.current_housing_has_mortgage ?? false) ? "bg-red-500" : "bg-green-500"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                      (data.current_housing_has_mortgage ?? false) ? "right-1" : "left-1"
                    )} />
                  </button>
                  <span className={cn("text-sm font-medium", (data.current_housing_has_mortgage ?? false) ? "text-red-600" : "text-slate-400")}>Да</span>
                </div>
              </div>

              {data.current_housing_has_mortgage && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-2">
                    <Label>Остатъчна сума (€) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.current_mortgage_remaining || ''}
                      onChange={(e) => onChange('current_mortgage_remaining', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лихвен процент (%) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={data.current_mortgage_interest_rate || ''}
                      onChange={(e) => onChange('current_mortgage_interest_rate', parseFloat(e.target.value) || '')}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Банка <span className="text-red-500">*</span></Label>
                    <Input
                      value={data.current_mortgage_bank || ''}
                      onChange={(e) => onChange('current_mortgage_bank', e.target.value)}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Оставащ период (години) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      max="35"
                      value={data.current_mortgage_remaining_years || ''}
                      onChange={(e) => onChange('current_mortgage_remaining_years', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Месечна вноска (€) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.current_mortgage_monthly_payment || ''}
                      onChange={(e) => onChange('current_mortgage_monthly_payment', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                      required
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
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", !(data.planning_housing_change ?? true) ? "text-red-600" : "text-slate-400")}>Не</span>
            <button
              type="button"
              onClick={() => onChange('planning_housing_change', !(data.planning_housing_change ?? true))}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                (data.planning_housing_change ?? true) ? "bg-green-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-1 transition-all",
                (data.planning_housing_change ?? true) ? "right-1" : "left-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium", (data.planning_housing_change ?? true) ? "text-green-600" : "text-slate-400")}>Да</span>
          </div>
        </div>

        {(data.planning_housing_change ?? true) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Вид на промяната <span className="text-red-500">*</span></Label>
              <Select 
                value={data.planned_housing_type || ''} 
                onValueChange={(value) => onChange('planned_housing_type', value)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Покупка Апартамент или Къща</SelectItem>
                  <SelectItem value="house">Строителство на Къща</SelectItem>
                  <SelectItem value="reconstruction">Реконструкция и ремонтни дейности</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full fields for apartment and house */}
            {(data.planned_housing_type === 'apartment' || data.planned_housing_type === 'house') && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Брой стаи <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={data.planned_housing_rooms || ''}
                    onChange={(e) => onChange('planned_housing_rooms', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Застроена площ (кв.м) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="10"
                    value={data.planned_housing_area || ''}
                    onChange={(e) => onChange('planned_housing_area', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Стойност на имота (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.planned_housing_value || ''}
                    onChange={(e) => onChange('planned_housing_value', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Времеви хоризонт (години) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={data.planned_housing_timeline_years || ''}
                    onChange={(e) => onChange('planned_housing_timeline_years', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Общи разходи - ремонт и обзавеждане (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.planned_housing_extra_costs || ''}
                    onChange={(e) => onChange('planned_housing_extra_costs', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
              </div>
            )}

            {/* Limited fields for reconstruction */}
            {data.planned_housing_type === 'reconstruction' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Времеви хоризонт (години) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={data.planned_housing_timeline_years || ''}
                    onChange={(e) => onChange('planned_housing_timeline_years', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Общи разходи - ремонт и обзавеждане (€) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.planned_housing_extra_costs || ''}
                    onChange={(e) => onChange('planned_housing_extra_costs', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financing - only show if planning change */}
      {(data.planning_housing_change ?? true) && data.planned_housing_type && (
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Начин на финансиране</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Метод на финансиране <span className="text-red-500">*</span></Label>
              <Select 
                value={data.financing_method || ''} 
                onValueChange={(value) => onChange('financing_method', value)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Изберете" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Пари в брой</SelectItem>
                  <SelectItem value="cash_and_loan">Пари в брой + заем / кредит</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show only cash field for cash method, full form for cash_and_loan */}
            {data.financing_method === 'cash' ? (
              <div className="space-y-2">
                <Label>
                  Наличност в брой към момента на {
                    data.planned_housing_type === 'apartment' ? 'Закупуването' :
                    data.planned_housing_type === 'house' ? 'строителството' :
                    'Ремонта и реконструкцията'
                  } (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={data.available_cash || ''}
                  onChange={(e) => onChange('available_cash', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                  required
                />
              </div>
            ) : data.financing_method === 'cash_and_loan' ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Наличност в брой към момента на {
                        data.planned_housing_type === 'apartment' ? 'Закупуването' :
                        data.planned_housing_type === 'house' ? 'строителството' :
                        'Ремонта и реконструкцията'
                      } (€) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.available_cash || ''}
                      onChange={(e) => onChange('available_cash', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Размер на заема (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedLoanAmount}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лихвен процент (%) <span className="text-red-500">*</span></Label>
                    <Select 
                      value={(data.loan_interest_rate || 3).toString()} 
                      onValueChange={(value) => onChange('loan_interest_rate', parseFloat(value))}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {interestRateOptions.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Срок на изплащане (години) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="1"
                      max="35"
                      value={data.loan_term_years || ''}
                      onChange={(e) => onChange('loan_term_years', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Очаквана месечна вноска (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedMonthlyPayment}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Общо надплащане (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={totalOverpayment}
                      readOnly
                      className="rounded-lg bg-red-100 text-red-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Savings highlight */}
                {totalOverpayment > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">Можем да спестим между:</span>
                      <span className="text-green-800 font-bold text-lg">{potentialSavingsMin.toLocaleString('bg-BG')} € - {potentialSavingsMax.toLocaleString('bg-BG')} €</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Това е между 30% и 40% от общото надплащане по кредита. Това постигаме, чрез преференциални кредитни условия, по-изгодно застраховане и ефективен Инвестиционно-погасителен план.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Referrals Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Кой от вашите познати:</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Not living in own home */}
          <div className="space-y-3">
            <Label className="text-slate-700">Все още не живее в собствено жилище (живее при родителите си, под наем...)</Label>
            {(data.referrals_no_own_home || ['']).map((name, index) => (
              <Input
                key={`no_home_${index}`}
                placeholder="Име на познат"
                value={name}
                onChange={(e) => {
                  const newList = [...(data.referrals_no_own_home || [''])];
                  newList[index] = e.target.value;
                  // Add new empty field if this is the last one and it has content
                  if (index === newList.length - 1 && e.target.value) {
                    newList.push('');
                  }
                  onChange('referrals_no_own_home', newList);
                }}
                className="rounded-lg"
              />
            ))}
          </div>

          {/* Living in own home for long time */}
          <div className="space-y-3">
            <Label className="text-slate-700">Вече дълго време живее в собствено жилище</Label>
            {(data.referrals_own_home_long || ['']).map((name, index) => (
              <Input
                key={`own_home_${index}`}
                placeholder="Име на познат"
                value={name}
                onChange={(e) => {
                  const newList = [...(data.referrals_own_home_long || [''])];
                  newList[index] = e.target.value;
                  // Add new empty field if this is the last one and it has content
                  if (index === newList.length - 1 && e.target.value) {
                    newList.push('');
                  }
                  onChange('referrals_own_home_long', newList);
                }}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Birthday Example Section */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Пример с Рожден Ден</h3>
          <Switch
            checked={data.birthday_example_enabled || false}
            onCheckedChange={(checked) => onChange('birthday_example_enabled', checked)}
          />
        </div>

        {data.birthday_example_enabled && (
          <div className="space-y-6">
            {/* Display birthdays */}
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <Label className="text-slate-700 mb-2 block">Рожден ден:</Label>
              <div className="flex flex-wrap gap-4 text-slate-600">
                {data.client_birthdate && (
                  <span>Клиент: {new Date(data.client_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}</span>
                )}
                {data.include_partner && data.partner_birthdate && (
                  <span>Партньор: {new Date(data.partner_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}</span>
                )}
              </div>
            </div>

            {/* Question 1: Where would you celebrate */}
            <div className="space-y-3">
              <Label className="text-slate-700">
                Представете си, че днес е {data.client_birthdate ? new Date(data.client_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' }) : '(вашият рожден ден)'}{data.include_partner && data.partner_birthdate ? ` / ${new Date(data.partner_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}` : ''} и <span className="font-bold">имате неограничен бюджет</span>! Къде бихте празнували своя рожен ден?
              </Label>
              <Input
                placeholder="Опишете мястото..."
                value={data.birthday_celebration_place || ''}
                onChange={(e) => onChange('birthday_celebration_place', e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Question 2: How many people - only show if place is filled */}
            {data.birthday_celebration_place && (
              <div className="space-y-3">
                <Label className="text-slate-700">
                  Представете си, че е {data.client_birthdate ? new Date(data.client_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' }) : '(вашият рожден ден)'}{data.include_partner && data.partner_birthdate ? ` / ${new Date(data.partner_birthdate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}` : ''}, <span className="font-bold">имате неограничен бюджет и организирате едно голямо парти. Колко човека бихте поканили на едно такова голямо парти?</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Брой гости"
                  value={data.birthday_party_guests_total || ''}
                  onChange={(e) => onChange('birthday_party_guests_total', parseInt(e.target.value) || '')}
                  className="rounded-lg w-48"
                />
              </div>
            )}

            {/* Question 3: Categories breakdown - only show if total guests is filled */}
            {data.birthday_party_guests_total > 0 && (
              <div className="space-y-4">
                <Label className="text-slate-700">
                  Колко от тези {data.birthday_party_guests_total} биха били Семейство, Приятели, Колеги?
                </Label>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Семейство</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_family || ''}
                      onChange={(e) => onChange('birthday_guests_family', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Приятели</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_friends || ''}
                      onChange={(e) => onChange('birthday_guests_friends', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Колеги</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={data.birthday_guests_colleagues || ''}
                      onChange={(e) => onChange('birthday_guests_colleagues', parseInt(e.target.value) || '')}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Warning if sum is less than total */}
                {((data.birthday_guests_family || 0) + (data.birthday_guests_friends || 0) + (data.birthday_guests_colleagues || 0)) > 0 &&
                 ((data.birthday_guests_family || 0) + (data.birthday_guests_friends || 0) + (data.birthday_guests_colleagues || 0)) < data.birthday_party_guests_total && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    Общият сбор е по-малък от посоченото по-горе.
                  </div>
                )}

                {/* Name fields for each category */}
                {(data.birthday_guests_family > 0 || data.birthday_guests_friends > 0 || data.birthday_guests_colleagues > 0) && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-slate-200">
                    {/* Family names */}
                    {data.birthday_guests_family > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">Имена на Семейство ({data.birthday_guests_family})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_family }).map((_, index) => (
                            <Input
                              key={`family_${index}`}
                              placeholder={`Семейство ${index + 1}`}
                              value={(data.birthday_family_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_family_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_family_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Friends names */}
                    {data.birthday_guests_friends > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">Имена на Приятели ({data.birthday_guests_friends})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_friends }).map((_, index) => (
                            <Input
                              key={`friends_${index}`}
                              placeholder={`Приятел ${index + 1}`}
                              value={(data.birthday_friends_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_friends_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_friends_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Colleagues names */}
                    {data.birthday_guests_colleagues > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-700 font-medium">Имена на Колеги ({data.birthday_guests_colleagues})</Label>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: data.birthday_guests_colleagues }).map((_, index) => (
                            <Input
                              key={`colleagues_${index}`}
                              placeholder={`Колега ${index + 1}`}
                              value={(data.birthday_colleagues_names || [])[index] || ''}
                              onChange={(e) => {
                                const newNames = [...(data.birthday_colleagues_names || [])];
                                newNames[index] = e.target.value;
                                onChange('birthday_colleagues_names', newNames);
                              }}
                              className="rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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