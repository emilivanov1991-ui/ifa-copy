import React from 'react';
import { User, Wallet, Target, CheckCircle } from 'lucide-react';

export default function ReviewStep({ data }) {
  const formatCurrency = (value) => {
    if (!value) return 'Not provided';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatLabel = (value) => {
    if (!value) return 'Not provided';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">Almost done!</p>
          <p className="text-sm text-green-700">Please review your information below before submitting.</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Personal Information</h3>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900">{data.first_name} {data.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium text-slate-900">{data.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="font-medium text-slate-900">{data.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Age</p>
              <p className="font-medium text-slate-900">{data.age || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Marital Status</p>
              <p className="font-medium text-slate-900">{formatLabel(data.marital_status)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Dependents</p>
              <p className="font-medium text-slate-900">{data.dependents ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Employment</p>
              <p className="font-medium text-slate-900">{formatLabel(data.employment_status)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Occupation</p>
              <p className="font-medium text-slate-900">{data.occupation || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Wallet className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Financial Information</h3>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Annual Income</p>
              <p className="font-medium text-slate-900">{formatCurrency(data.annual_income)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Expenses</p>
              <p className="font-medium text-slate-900">{formatCurrency(data.monthly_expenses)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Savings</p>
              <p className="font-medium text-slate-900">{formatCurrency(data.total_savings)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Debt</p>
              <p className="font-medium text-slate-900">{formatCurrency(data.total_debt)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Retirement Accounts</p>
              <p className="font-medium text-slate-900">{formatCurrency(data.retirement_accounts)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Owns Home</p>
              <p className="font-medium text-slate-900">{data.owns_home ? 'Yes' : 'No'}</p>
            </div>
            {data.owns_home && (
              <>
                <div>
                  <p className="text-sm text-slate-500">Home Value</p>
                  <p className="font-medium text-slate-900">{formatCurrency(data.home_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mortgage Balance</p>
                  <p className="font-medium text-slate-900">{formatCurrency(data.mortgage_balance)}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-slate-500">Life Insurance</p>
              <p className="font-medium text-slate-900">{data.has_life_insurance ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Health Insurance</p>
              <p className="font-medium text-slate-900">{data.has_health_insurance ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Goals & Preferences</h3>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-500">Risk Tolerance</p>
              <p className="font-medium text-slate-900">{formatLabel(data.risk_tolerance)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Investment Timeline</p>
              <p className="font-medium text-slate-900">{formatLabel(data.investment_timeline)}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Primary Financial Goals</p>
            <div className="flex flex-wrap gap-2">
              {(data.primary_goals || []).length > 0 ? (
                data.primary_goals.map((goal) => (
                  <span 
                    key={goal} 
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">None selected</span>
              )}
            </div>
          </div>

          {data.additional_notes && (
            <div>
              <p className="text-sm text-slate-500 mb-1">Additional Notes</p>
              <p className="text-slate-700">{data.additional_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}