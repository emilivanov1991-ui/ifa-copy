import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

const commissionData = [
  { id: 1, client: 'Иван Петров', product: 'Инвестиционен план', amount: 450, status: 'paid', date: '2024-01-15', type: 'initial' },
  { id: 2, client: 'Мария Иванова', product: 'Животозастраховка', amount: 280, status: 'paid', date: '2024-01-18', type: 'initial' },
  { id: 3, client: 'Георги Димитров', product: 'Пенсионен фонд', amount: 180, status: 'pending', date: '2024-01-20', type: 'recurring' },
  { id: 4, client: 'Елена Стоянова', product: 'Спестовен план', amount: 120, status: 'pending', date: '2024-01-22', type: 'initial' },
  { id: 5, client: 'Петър Николов', product: 'Инвестиционен план', amount: 350, status: 'paid', date: '2024-01-10', type: 'recurring' },
  { id: 6, client: 'Анна Георгиева', product: 'Здравна застраховка', amount: 95, status: 'paid', date: '2024-01-08', type: 'initial' },
];

const summaryData = {
  totalEarned: 28500,
  thisMonth: 2450,
  pending: 300,
  lastMonth: 2180,
};

const statusConfig = {
  paid: { label: 'Изплатена', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Очаква', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

export default function ConsultantCommissions() {
  const [period, setPeriod] = useState('month');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredCommissions = commissionData.filter(c => 
    typeFilter === 'all' || c.type === typeFilter
  );

  const monthChange = ((summaryData.thisMonth - summaryData.lastMonth) / summaryData.lastMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Отчет на комисионни</h2>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Този месец</SelectItem>
              <SelectItem value="quarter">Тримесечие</SelectItem>
              <SelectItem value="year">Тази година</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Общо за годината</p>
                <p className="text-3xl font-bold mt-1">{summaryData.totalEarned.toLocaleString()} €</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Този месец</p>
                <p className="text-2xl font-bold mt-1">{summaryData.thisMonth.toLocaleString()} €</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  +{monthChange}%
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Очакващи плащане</p>
                <p className="text-2xl font-bold mt-1">{summaryData.pending.toLocaleString()} €</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Миналия месец</p>
                <p className="text-2xl font-bold mt-1">{summaryData.lastMonth.toLocaleString()} €</p>
              </div>
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Детайлен отчет</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="initial">Първоначални</SelectItem>
                <SelectItem value="recurring">Периодични</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Продукт</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Сума</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => {
                const StatusIcon = statusConfig[commission.status].icon;
                return (
                  <TableRow key={commission.id}>
                    <TableCell className="text-slate-500">{commission.date}</TableCell>
                    <TableCell className="font-medium">{commission.client}</TableCell>
                    <TableCell>{commission.product}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {commission.type === 'initial' ? 'Първоначална' : 'Периодична'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{commission.amount} €</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[commission.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[commission.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Разбивка по продукти</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { product: 'Инвестиционни планове', amount: 12500, percent: 44 },
              { product: 'Застраховки', amount: 8200, percent: 29 },
              { product: 'Пенсионни фондове', amount: 5300, percent: 19 },
              { product: 'Спестовни планове', amount: 2500, percent: 8 },
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.product}</span>
                  <span className="text-slate-600">{item.amount.toLocaleString()} € ({item.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}