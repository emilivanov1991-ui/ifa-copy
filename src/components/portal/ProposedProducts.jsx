import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Shield, 
  Umbrella, 
  PiggyBank, 
  CreditCard,
  Lightbulb,
  Phone
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
  investment: 'bg-blue-100 text-blue-700 border-blue-200',
  insurance: 'bg-purple-100 text-purple-700 border-purple-200',
  pension: 'bg-amber-100 text-amber-700 border-amber-200',
  savings: 'bg-green-100 text-green-700 border-green-200',
  loan: 'bg-red-100 text-red-700 border-red-200',
};

export default function ProposedProducts({ products }) {
  if (products.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Всички продукти са активирани!</h3>
          <p className="text-slate-600">
            Поздравления! Вие сте активирали всички препоръчани финансови продукти от вашия план.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800">
              Тези продукти са част от вашия финансов план, но все още не са активирани. 
              Свържете се с консултанта си за повече информация.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {products.map(product => {
          const Icon = typeIcons[product.type] || TrendingUp;

          return (
            <Card key={product.id} className={cn("border-2 border-dashed", typeColors[product.type]?.replace('bg-', 'border-').split(' ')[0])}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", typeColors[product.type])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[product.type]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{product.provider}</p>
                    
                    {product.notes && (
                      <p className="text-sm text-slate-600 mb-4">{product.notes}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {product.monthly_premium > 0 && (
                        <div>
                          <span className="text-slate-500">Месечна вноска: </span>
                          <span className="font-medium">{product.monthly_premium.toLocaleString('bg-BG')} €</span>
                        </div>
                      )}
                      {product.coverage_amount > 0 && (
                        <div>
                          <span className="text-slate-500">Покритие: </span>
                          <span className="font-medium">{product.coverage_amount.toLocaleString('bg-BG')} €</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4 rounded-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Свържете се за повече информация
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}