import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

const reportData = [
  { id: 1, period: '2024-01', client: 'Иван Петров', product: 'Инвестиции', type: 'initial', amount: 450, status: 'paid' },
  { id: 2, period: '2024-01', client: 'Мария Иванова', product: 'Застраховки', type: 'initial', amount: 280, status: 'paid' },
  { id: 3, period: '2024-01', client: 'Георги Димитров', product: 'Пенсионни', type: 'recurring', amount: 180, status: 'pending' },
  { id: 4, period: '2024-02', client: 'Елена Стоянова', product: 'Спестявания', type: 'initial', amount: 120, status: 'paid' },
  { id: 5, period: '2024-02', client: 'Петър Николов', product: 'Инвестиции', type: 'recurring', amount: 350, status: 'paid' },
  { id: 6, period: '2024-02', client: 'Анна Георгиева', product: 'Застраховки', type: 'initial', amount: 95, status: 'paid' },
  { id: 7, period: '2024-03', client: 'Стоян Петров', product: 'Пенсионни', type: 'initial', amount: 220, status: 'paid' },
  { id: 8, period: '2024-03', client: 'Иван Петров', product: 'Инвестиции', type: 'recurring', amount: 150, status: 'paid' },
];

const clients = ['Всички', 'Иван Петров', 'Мария Иванова', 'Георги Димитров', 'Елена Стоянова', 'Петър Николов', 'Анна Георгиева', 'Стоян Петров'];
const products = ['Всички', 'Инвестиции', 'Застраховки', 'Пенсионни', 'Спестявания'];
const periods = ['Всички', '2024-01', '2024-02', '2024-03', '2024-Q1', '2024'];

export default function ConsultantReports() {
  const [periodFilter, setPeriodFilter] = useState('Всички');
  const [clientFilter, setClientFilter] = useState('Всички');
  const [productFilter, setProductFilter] = useState('Всички');
  const [reportType, setReportType] = useState('monthly');

  const filteredData = reportData.filter(item => {
    const matchesPeriod = periodFilter === 'Всички' || 
      item.period === periodFilter || 
      (periodFilter === '2024-Q1' && ['2024-01', '2024-02', '2024-03'].includes(item.period)) ||
      (periodFilter === '2024' && item.period.startsWith('2024'));
    const matchesClient = clientFilter === 'Всички' || item.client === clientFilter;
    const matchesProduct = productFilter === 'Всички' || item.product === productFilter;
    return matchesPeriod && matchesClient && matchesProduct;
  });

  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = filteredData.filter(i => i.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = filteredData.filter(i => i.status === 'pending').reduce((sum, item) => sum + item.amount, 0);

  const exportToCSV = () => {
    const headers = ['Период', 'Клиент', 'Продукт', 'Тип', 'Сума', 'Статус'];
    const rows = filteredData.map(item => [
      item.period, item.client, item.product, item.type, item.amount, item.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    // Create printable content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Отчет за комисионни</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .summary { margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>APEX Financial - Отчет за комисионни</h1>
          <p>Генериран на: ${new Date().toLocaleDateString('bg-BG')}</p>
          <p>Период: ${periodFilter} | Клиент: ${clientFilter} | Продукт: ${productFilter}</p>
          <table>
            <tr><th>Период</th><th>Клиент</th><th>Продукт</th><th>Тип</th><th>Сума</th><th>Статус</th></tr>
            ${filteredData.map(item => `
              <tr>
                <td>${item.period}</td>
                <td>${item.client}</td>
                <td>${item.product}</td>
                <td>${item.type === 'initial' ? 'Първоначална' : 'Периодична'}</td>
                <td>${item.amount} €</td>
                <td>${item.status === 'paid' ? 'Изплатена' : 'Очаква'}</td>
              </tr>
            `).join('')}
          </table>
          <div class="summary">
            <strong>Обща сума: ${totalAmount} €</strong> | 
            Изплатени: ${paidAmount} € | 
            Очакващи: ${pendingAmount} €
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Генериране на отчети</h2>
          <p className="text-slate-500">Създавайте персонализирани отчети за комисионни и статистики</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Printer className="h-4 w-4 mr-2" />
            Печат
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Филтри
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Тип отчет</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Месечен</SelectItem>
                  <SelectItem value="quarterly">Тримесечен</SelectItem>
                  <SelectItem value="yearly">Годишен</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Период</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Клиент</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Продукт</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Обща сума</p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString()} €</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Изплатени</p>
                <p className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString()} €</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Очакващи</p>
                <p className="text-2xl font-bold text-amber-600">{pendingAmount.toLocaleString()} €</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Детайлни данни ({filteredData.length} записа)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Период</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Продукт</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Сума</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.period}</TableCell>
                  <TableCell className="font-medium">{item.client}</TableCell>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.type === 'initial' ? 'Първоначална' : 'Периодична'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{item.amount} €</TableCell>
                  <TableCell>
                    <Badge className={item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {item.status === 'paid' ? 'Изплатена' : 'Очаква'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}