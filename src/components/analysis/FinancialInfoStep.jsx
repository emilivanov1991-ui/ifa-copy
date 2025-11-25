import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DollarSign } from 'lucide-react';

export default function FinancialInfoStep({ data, onChange }) {
  const formatCurrency = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCurrency = (value) => {
    return parseInt(value.replace(/,/g, '')) || '';
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="annual_income">Annual Household Income</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="annual_income"
              placeholder="100,000"
              value={formatCurrency(data.annual_income)}
              onChange={(e) => onChange('annual_income', parseCurrency(e.target.value))}
              className="rounded-lg pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_expenses">Average Monthly Expenses</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="monthly_expenses"
              placeholder="5,000"
              value={formatCurrency(data.monthly_expenses)}
              onChange={(e) => onChange('monthly_expenses', parseCurrency(e.target.value))}
              className="rounded-lg pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_savings">Total Savings & Investments</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="total_savings"
              placeholder="50,000"
              value={formatCurrency(data.total_savings)}
              onChange={(e) => onChange('total_savings', parseCurrency(e.target.value))}
              className="rounded-lg pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_debt">Total Outstanding Debt</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="total_debt"
              placeholder="20,000"
              value={formatCurrency(data.total_debt)}
              onChange={(e) => onChange('total_debt', parseCurrency(e.target.value))}
              className="rounded-lg pl-9"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="retirement_accounts">Retirement Accounts (401k, IRA, etc.)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="retirement_accounts"
            placeholder="150,000"
            value={formatCurrency(data.retirement_accounts)}
            onChange={(e) => onChange('retirement_accounts', parseCurrency(e.target.value))}
            className="rounded-lg pl-9"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 space-y-4">
        <h4 className="font-medium text-slate-900">Real Estate</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="owns_home" className="cursor-pointer">Do you own a home?</Label>
          <Switch
            id="owns_home"
            checked={data.owns_home || false}
            onCheckedChange={(checked) => onChange('owns_home', checked)}
          />
        </div>

        {data.owns_home && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="home_value">Estimated Home Value</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="home_value"
                  placeholder="400,000"
                  value={formatCurrency(data.home_value)}
                  onChange={(e) => onChange('home_value', parseCurrency(e.target.value))}
                  className="rounded-lg pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_balance">Mortgage Balance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="mortgage_balance"
                  placeholder="250,000"
                  value={formatCurrency(data.mortgage_balance)}
                  onChange={(e) => onChange('mortgage_balance', parseCurrency(e.target.value))}
                  className="rounded-lg pl-9"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-6 space-y-4">
        <h4 className="font-medium text-slate-900">Insurance Coverage</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="has_life_insurance" className="cursor-pointer">Life Insurance</Label>
          <Switch
            id="has_life_insurance"
            checked={data.has_life_insurance || false}
            onCheckedChange={(checked) => onChange('has_life_insurance', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="has_health_insurance" className="cursor-pointer">Health Insurance</Label>
          <Switch
            id="has_health_insurance"
            checked={data.has_health_insurance || false}
            onCheckedChange={(checked) => onChange('has_health_insurance', checked)}
          />
        </div>
      </div>
    </div>
  );
}