import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const riskOptions = [
  {
    value: 'conservative',
    title: 'Conservative',
    description: 'Preserve capital, minimal risk'
  },
  {
    value: 'moderate',
    title: 'Moderate',
    description: 'Balanced growth and stability'
  },
  {
    value: 'aggressive',
    title: 'Aggressive',
    description: 'Maximum growth, higher risk'
  }
];

const timelineOptions = [
  {
    value: 'short_term',
    title: 'Short Term',
    description: '1-3 years'
  },
  {
    value: 'medium_term',
    title: 'Medium Term',
    description: '3-10 years'
  },
  {
    value: 'long_term',
    title: 'Long Term',
    description: '10+ years'
  }
];

const goalOptions = [
  'Retirement Planning',
  'Wealth Building',
  'Education Funding',
  'Home Purchase',
  'Debt Reduction',
  'Emergency Fund',
  'Estate Planning',
  'Tax Optimization',
  'Business Investment',
  'Passive Income'
];

export default function GoalsStep({ data, onChange }) {
  const handleGoalToggle = (goal) => {
    const currentGoals = data.primary_goals || [];
    if (currentGoals.includes(goal)) {
      onChange('primary_goals', currentGoals.filter(g => g !== goal));
    } else {
      onChange('primary_goals', [...currentGoals, goal]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Risk Tolerance */}
      <div className="space-y-4">
        <Label className="text-base">Risk Tolerance</Label>
        <div className="grid sm:grid-cols-3 gap-4">
          {riskOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('risk_tolerance', option.value)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                data.risk_tolerance === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "font-medium mb-1",
                data.risk_tolerance === option.value ? "text-blue-700" : "text-slate-900"
              )}>
                {option.title}
              </div>
              <div className="text-sm text-slate-500">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Investment Timeline */}
      <div className="space-y-4">
        <Label className="text-base">Investment Timeline</Label>
        <div className="grid sm:grid-cols-3 gap-4">
          {timelineOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('investment_timeline', option.value)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                data.investment_timeline === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "font-medium mb-1",
                data.investment_timeline === option.value ? "text-blue-700" : "text-slate-900"
              )}>
                {option.title}
              </div>
              <div className="text-sm text-slate-500">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Financial Goals */}
      <div className="space-y-4">
        <Label className="text-base">Primary Financial Goals (Select all that apply)</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          {goalOptions.map((goal) => (
            <label
              key={goal}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                (data.primary_goals || []).includes(goal)
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <Checkbox
                checked={(data.primary_goals || []).includes(goal)}
                onCheckedChange={() => handleGoalToggle(goal)}
              />
              <span className={cn(
                "font-medium",
                (data.primary_goals || []).includes(goal) ? "text-blue-700" : "text-slate-700"
              )}>
                {goal}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional Information or Questions</Label>
        <Textarea
          id="additional_notes"
          placeholder="Tell us anything else that would help us understand your financial situation and goals..."
          value={data.additional_notes || ''}
          onChange={(e) => onChange('additional_notes', e.target.value)}
          rows={5}
          className="rounded-lg resize-none"
        />
      </div>
    </div>
  );
}