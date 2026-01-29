import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Euro, 
  CheckCircle2, 
  XCircle,
  ArrowRight 
} from 'lucide-react';

export default function PlanComparison({ plans, onSelectPlan }) {
  if (!plans || plans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          Няма планове за сравнение
        </CardContent>
      </Card>
    );
  }

  // Group products by type for comparison
  const getProductsByType = (plan) => {
    const grouped = {};
    (plan.products || []).forEach(product => {
      const type = product.product_type;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(product);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Сравнение на варианти
        </h2>
        <p className="text-slate-600">
          Изберете най-подходящия план за вашите нужди
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const productsByType = getProductsByType(plan);
          const hasInvestments = plan.products.some(p => 
            ['ul_investment', 'investment'].includes(p.product_type)
          );
          const hasHealthInsurance = plan.products.some(p => 
            p.product_type === 'health_insurance'
          );
          const totalInvestments = plan.products
            .filter(p => ['ul_investment', 'investment'].includes(p.product_type))
            .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);
          const totalInsurance = plan.products
            .filter(p => ['health_insurance', 'insurance', 'term_life'].includes(p.product_type))
            .reduce((sum, p) => sum + (p.monthly_premium || 0), 0);

          return (
            <Card 
              key={idx}
              className="relative overflow-hidden hover:shadow-xl transition-shadow"
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  ПРЕПОРЪЧАНО
                </div>
              )}
              
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                <CardTitle className="text-lg">
                  Вариант {idx + 1}
                </CardTitle>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {plan.total_monthly_premium.toFixed(0)} €
                  </div>
                  <div className="text-xs text-slate-500">на месец</div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Инвестиции</div>
                    <div className="text-lg font-bold text-blue-600">
                      {totalInvestments.toFixed(0)} €
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Застраховки</div>
                    <div className="text-lg font-bold text-green-600">
                      {totalInsurance.toFixed(0)} €
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {hasInvestments ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={hasInvestments ? 'text-slate-700' : 'text-slate-400'}>
                      Unit Linked инвестиции
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {hasHealthInsurance ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={hasHealthInsurance ? 'text-slate-700' : 'text-slate-400'}>
                      Здравно осигуряване
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700">
                      {plan.products.length} продукта
                    </span>
                  </div>

                  {plan.total_coverage > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">
                        Покритие {(plan.total_coverage / 1000).toFixed(0)}K €
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Categories */}
                <div className="border-t pt-3 space-y-2">
                  {Object.entries(productsByType).map(([type, products]) => (
                    <div key={type} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">
                        {type === 'ul_investment' ? 'Unit Linked' :
                         type === 'health_insurance' ? 'Здравни' :
                         type === 'pension_plan' ? 'Пенсионни' :
                         type === 'investment' ? 'Инвестиции' : 'Застраховки'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {products.length}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button 
                  className="w-full mt-4"
                  variant={idx === 0 ? "default" : "outline"}
                  onClick={() => onSelectPlan && onSelectPlan(plan)}
                >
                  {idx === 0 ? (
                    <>
                      Избери този план
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Виж детайли'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детайлно сравнение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-slate-600 font-medium">Характеристика</th>
                  {plans.map((_, idx) => (
                    <th key={idx} className="text-center py-2 px-3 text-slate-600 font-medium">
                      Вариант {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 text-slate-700">Месечна премия</td>
                  {plans.map((plan, idx) => (
                    <td key={idx} className="text-center py-2 px-3 font-semibold text-blue-600">
                      {plan.total_monthly_premium.toFixed(0)} €
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 text-slate-700">Годишна премия</td>
                  {plans.map((plan, idx) => (
                    <td key={idx} className="text-center py-2 px-3">
                      {(plan.total_monthly_premium * 12).toFixed(0)} €
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 text-slate-700">Брой продукти</td>
                  {plans.map((plan, idx) => (
                    <td key={idx} className="text-center py-2 px-3">
                      {plan.products.length}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 text-slate-700">Общо покритие</td>
                  {plans.map((plan, idx) => (
                    <td key={idx} className="text-center py-2 px-3">
                      {(plan.total_coverage / 1000).toFixed(0)}K €
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 text-slate-700">Данъчно облекчение</td>
                  {plans.map((plan, idx) => {
                    const taxReliefBase = (plan.products || [])
                      .filter(p => ['ul_investment', 'pension_plan', 'health_insurance'].includes(p.product_type))
                      .reduce((sum, p) => sum + (p.total_premium || 0), 0);
                    const taxRelief = taxReliefBase * 0.1;
                    return (
                      <td key={idx} className="text-center py-2 px-3 text-green-600 font-semibold">
                        {taxRelief.toFixed(0)} €/год
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}