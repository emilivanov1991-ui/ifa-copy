import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Shield, 
  Umbrella, 
  PiggyBank, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2
} from 'lucide-react';
import { cn } from "@/lib/utils";

const typeIcons = {
  investment: TrendingUp,
  insurance: Shield,
  pension: Umbrella,
  savings: PiggyBank,
  loan: CreditCard,
};

const typeLabels = {
  investment: 'Инвестиция',
  insurance: 'Застраховка',
  pension: 'Пенсионен',
  savings: 'Спестяване',
  loan: 'Кредит',
};

const typeColors = {
  investment: 'bg-blue-100 text-blue-700',
  insurance: 'bg-purple-100 text-purple-700',
  pension: 'bg-amber-100 text-amber-700',
  savings: 'bg-green-100 text-green-700',
  loan: 'bg-red-100 text-red-700',
};

export default function ProductsList({ products }) {
  const [expandedId, setExpandedId] = useState(null);

  if (products.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Нямате активни финансови продукти.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {products.map(product => {
        const Icon = typeIcons[product.type] || TrendingUp;
        const isExpanded = expandedId === product.id;
        const growth = product.initial_value > 0 
          ? ((product.current_value - product.initial_value) / product.initial_value * 100).toFixed(1)
          : 0;

        return (
          <Card key={product.id} className="bg-white">
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeColors[product.type])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[product.type]}
                      </Badge>
                      <span className="text-sm text-slate-500">{product.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-lg">{(product.current_value || 0).toLocaleString('bg-BG')} €</p>
                    {product.type === 'investment' && growth !== 0 && (
                      <p className={cn("text-sm", growth > 0 ? "text-green-600" : "text-red-600")}>
                        {growth > 0 ? '+' : ''}{growth}%
                      </p>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {product.start_date && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Начална дата</p>
                        <p className="font-medium">{new Date(product.start_date).toLocaleDateString('bg-BG')}</p>
                      </div>
                    )}
                    {product.maturity_date && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Падеж</p>
                        <p className="font-medium">{new Date(product.maturity_date).toLocaleDateString('bg-BG')}</p>
                      </div>
                    )}
                    {product.monthly_premium > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Месечна вноска</p>
                        <p className="font-medium">{product.monthly_premium.toLocaleString('bg-BG')} €</p>
                      </div>
                    )}
                    {product.interest_rate && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Лихва</p>
                        <p className="font-medium">{product.interest_rate}%</p>
                      </div>
                    )}
                    {product.coverage_amount > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Застрахователна сума</p>
                        <p className="font-medium">{product.coverage_amount.toLocaleString('bg-BG')} €</p>
                      </div>
                    )}
                    {product.initial_value > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Начална стойност</p>
                        <p className="font-medium">{product.initial_value.toLocaleString('bg-BG')} €</p>
                      </div>
                    )}
                  </div>
                  {product.coverage_details && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Покритие</p>
                      <p className="text-sm">{product.coverage_details}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}