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

          {/* Address field for owned housing */}
          {data.current_housing === 'owned' && (
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input
                placeholder="гр. София, ул. Примерна 1, ап. 5"
                value={data.current_housing_address || ''}
                onChange={(e) => onChange('current_housing_address', e.target.value)}
                className="rounded-lg"
              />
            </div>
          )}

          <div className={cn("grid gap-4", (data.current_housing === 'with_parents' || data.current_housing === 'rented' || data.current_housing === 'subrented') ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
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
            {data.current_housing === 'owned' && (
              <>
                <div className="space-y-2">
                  <Label>Стойност (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="150000"
                    value={data.current_housing_value || ''}
                    onChange={(e) => onChange('current_housing_value', parseInt(e.target.value) || '')}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Стойност на движимо имущество (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={data.current_housing_movable_value || ''}
                    onChange={(e) => onChange('current_housing_movable_value', parseInt(e.target.value) || '')}
                    className="rounded-lg"
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
                <Switch
                  checked={data.current_housing_has_mortgage || false}
                  onCheckedChange={(checked) => onChange('current_housing_has_mortgage', checked)}
                />
              </div>

              {data.current_housing_has_mortgage && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-2">
                    <Label>Остатъчна сума (€)</Label>
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
                    <Label>Месечна вноска (€)</Label>
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
                <Label>Стойност на имота (€)</Label>
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
                <Label>Общи разходи - ремонт и обзавеждане (€)</Label>
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

      {/* Financing - only show if planning change */}
      {data.planning_housing_change && (
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
                  <SelectItem value="cash_and_loan">Пари в брой + заем / кредит</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show only cash field for cash method, full form for cash_and_loan */}
            {data.financing_method === 'cash' ? (
              <div className="space-y-2">
                <Label>Наличност в брой (€)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={data.available_cash || ''}
                  onChange={(e) => onChange('available_cash', parseInt(e.target.value) || '')}
                  className="rounded-lg"
                />
              </div>
            ) : data.financing_method === 'cash_and_loan' ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Наличност в брой (€)</Label>
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
                    <Label>Размер на заема (€) - автоматично</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedLoanAmount}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лихвен процент (%)</Label>
                    <Select 
                      value={(data.loan_interest_rate || 3).toString()} 
                      onValueChange={(value) => onChange('loan_interest_rate', parseFloat(value))}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="3%" />
                      </SelectTrigger>
                      <SelectContent>
                        {interestRateOptions.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label>Очаквана месечна вноска (€) - автоматично</Label>
                    <Input
                      type="number"
                      min="0"
                      value={calculatedMonthlyPayment}
                      readOnly
                      className="rounded-lg bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Общо надплащане (€) - автоматично</Label>
                    <Input
                      type="number"
                      min="0"
                      value={totalOverpayment}
                      readOnly
                      className="rounded-lg bg-slate-100"
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