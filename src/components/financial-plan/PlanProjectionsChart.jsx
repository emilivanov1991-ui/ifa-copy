import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Shield, PieChart as PieIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'growth',     label: 'Растеж',       icon: TrendingUp },
  { id: 'protection', label: 'Защита',        icon: Shield },
  { id: 'breakdown',  label: 'Разпределение', icon: PieIcon },
];

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const PRODUCT_TYPE_LABELS = {
  ul_investment:    'Инвестиции',
  term_life:        'Живот',
  health_insurance: 'Здраве',
  critical_illness: 'Критична болест',
  pension_plan:     'Пенсия',
  education_plan:   'Образование',
  personal_accident:'Злополука',
};

function fv(pmt, r, n) {
  if (r === 0) return pmt * n * 12;
  return pmt * ((Math.pow(1 + r / 12, n * 12) - 1) / (r / 12));
}

function formatEur(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M €';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K €';
  return v.toFixed(0) + ' €';
}

// Custom tooltip for LineChart
function GrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">Година {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {formatEur(p.value)}</p>
      ))}
    </div>
  );
}

export default function PlanProjectionsChart({ plan, offers, analysisData }) {
  const [tab, setTab] = useState('growth');

  const clientAge = analysisData?.client_age || plan?.partner1_age || 35;
  const partnerAge = analysisData?.partner_age || plan?.partner2_age || null;
  const yearsToRetirement = Math.max(5, 65 - clientAge);

  // Monthly investment premium (UL products only)
  const monthlyInvestment = useMemo(() => {
    const investmentTypes = ['ul_investment', 'education_plan', 'pension_plan'];
    const fromOffers = (offers || [])
      .filter(o => investmentTypes.includes(o.product_type))
      .reduce((s, o) => s + (o.monthly_premium || 0), 0);
    // If no investment products found, use available_for_investment from plan or a reasonable fallback
    return fromOffers || plan?.available_for_investment || 0;
  }, [offers, plan]);

  // Growth data
  const growthData = useMemo(() => {
    const data = [];
    const step = yearsToRetirement <= 20 ? 1 : 2;
    for (let y = 0; y <= yearsToRetirement; y += step) {
      data.push({
        year: y,
        conservative: Math.round(fv(monthlyInvestment, 0.04, y)),
        balanced:     Math.round(fv(monthlyInvestment, 0.07, y)),
        dynamic:      Math.round(fv(monthlyInvestment, 0.10, y)),
      });
    }
    return data;
  }, [monthlyInvestment, yearsToRetirement]);

  // Protection bar data — group by product type
  const protectionData = useMemo(() => {
    if (!offers?.length) return [];
    const groups = {};
    offers.forEach(o => {
      const label = PRODUCT_TYPE_LABELS[o.product_type] || o.product_type || 'Друго';
      if (!groups[label]) groups[label] = 0;
      groups[label] += o.coverage_amount || 0;
    });
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [offers]);

  // Breakdown pie data — by monthly premium
  const breakdownData = useMemo(() => {
    if (!offers?.length) return [];
    return offers
      .filter(o => (o.monthly_premium || 0) > 0)
      .map(o => ({
        name: o.product_name?.length > 22 ? o.product_name.slice(0, 22) + '…' : (o.product_name || o.provider),
        value: o.monthly_premium,
      }));
  }, [offers]);

  const retirementValues = growthData[growthData.length - 1] || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-full p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Growth Chart */}
      {tab === 'growth' && (
        <div>
          <p className="text-xs text-slate-500 mb-4">
            Месечна инвестиция: <span className="font-semibold text-slate-800">{monthlyInvestment} €</span> · Хоризонт: <span className="font-semibold text-slate-800">{yearsToRetirement} год.</span> до пенсия
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `+${v}г`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatEur} width={56} />
              <Tooltip content={<GrowthTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="conservative" name="Консервативен 4%" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="balanced"     name="Балансиран 7%"    stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="dynamic"      name="Динамичен 10%"   stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Консервативен', value: retirementValues.conservative, color: 'text-slate-600' },
              { label: 'Балансиран',    value: retirementValues.balanced,     color: 'text-blue-600' },
              { label: 'Динамичен',     value: retirementValues.dynamic,      color: 'text-indigo-600' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={cn('text-base font-bold', s.color)}>{s.value ? formatEur(s.value) : '—'}</p>
                <p className="text-[10px] text-slate-400">при пенсия</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protection Bar Chart */}
      {tab === 'protection' && (
        <div>
          {protectionData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Няма данни за покритие</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-4">Застрахователно покритие по категория (€)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={protectionData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatEur} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatEur(v)} />
                  <Bar dataKey="value" name="Покритие" radius={[0, 6, 6, 0]}>
                    {protectionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {/* Breakdown Pie */}
      {tab === 'breakdown' && (
        <div>
          {breakdownData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Няма продукти</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {breakdownData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} €`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-max">
                {breakdownData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-600">{d.name}</span>
                    <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">{d.value} €</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Общо</span>
                  <span className="text-xs font-bold text-blue-700 ml-auto">
                    {breakdownData.reduce((s, d) => s + d.value, 0).toFixed(2)} €/мес
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}