import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

export default function PlaceholderCalculator({ productName, provider, description }) {
  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100">
        <CardTitle className="text-lg text-slate-700">
          {provider} - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 mb-2">Продуктът е в процес на конфигуриране</p>
            <p className="text-sm text-blue-700">
              {description || 'Този продукт скоро ще бъде наличен с пълна функционалност за изчисление на премии и генериране на оферти.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}