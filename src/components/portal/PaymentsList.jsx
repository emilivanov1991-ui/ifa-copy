import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
  paid: { label: 'Платена', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Предстояща', color: 'bg-blue-100 text-blue-700', icon: Clock },
  overdue: { label: 'Просрочена', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Отменена', color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

const typeLabels = {
  premium: 'Премия',
  contribution: 'Вноска',
  one_time: 'Еднократна',
};

export default function PaymentsList({ payments, products }) {
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Неизвестен продукт';
  };

  if (payments.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Няма записани вноски.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>История на вноските</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Продукт</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Тип</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Сума</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Падеж</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Платена на</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Статус</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const status = statusConfig[payment.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <span className="font-medium">{getProductName(payment.product_id)}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {typeLabels[payment.payment_type] || payment.payment_type}
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {payment.amount.toLocaleString('bg-BG')} €
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {payment.due_date ? new Date(payment.due_date).toLocaleDateString('bg-BG') : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('bg-BG') : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={cn("flex items-center gap-1 w-fit", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}