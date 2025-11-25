import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function PortfolioChart({ history }) {
  // Generate sample data if no history
  const chartData = history.length > 0 
    ? history.map(h => ({
        date: new Date(h.date).toLocaleDateString('bg-BG', { month: 'short', year: '2-digit' }),
        value: h.total_value,
        investments: h.investments_value || 0,
        savings: h.savings_value || 0,
        pension: h.pension_value || 0,
      }))
    : [
        { date: 'Яну 24', value: 10000, investments: 5000, savings: 3000, pension: 2000 },
        { date: 'Фев 24', value: 10500, investments: 5300, savings: 3100, pension: 2100 },
        { date: 'Мар 24', value: 11200, investments: 5800, savings: 3200, pension: 2200 },
        { date: 'Апр 24', value: 11000, investments: 5600, savings: 3200, pension: 2200 },
        { date: 'Май 24', value: 11800, investments: 6100, savings: 3300, pension: 2400 },
        { date: 'Юни 24', value: 12500, investments: 6500, savings: 3400, pension: 2600 },
      ];

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[0]?.value || 0;
  const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 0;

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Развитие на портфолиото</CardTitle>
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold">+{change}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString('bg-BG')} €`, 'Стойност']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}