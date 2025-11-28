import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  FileText,
  Building2,
  PieChart,
  Filter,
  Loader2,
  XCircle,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: 'Очаква одобрение', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  approved: { label: 'Одобрена', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  paid: { label: 'Изплатена', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Отказана', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const productTypeLabels = {
  investment: 'Инвестиция',
  insurance: 'Застраховка',
  pension: 'Пенсия',
  savings: 'Спестявания',
  loan: 'Кредит'
};

const commissionTypeLabels = {
  initial: 'Първоначална',
  recurring: 'Периодична',
  bonus: 'Бонус'
};

export default function CommissionsManager({ consultantEmail }) {
  const [period, setPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('month');

  // Fetch commissions
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['commissions', consultantEmail],
    queryFn: async () => {
      const allCommissions = await base44.entities.Commission.list('-deal_date');
      // Filter by consultant if provided
      if (consultantEmail) {
        return allCommissions.filter(c => c.consultant_email === consultantEmail);
      }
      return allCommissions;
    },
  });

  // Filter commissions
  const filteredCommissions = useMemo(() => {
    let result = commissions;

    // Period filter
    if (period !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(c => new Date(c.deal_date) >= startDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(c => c.commission_type === typeFilter);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.client_name?.toLowerCase().includes(term) ||
        c.product_name?.toLowerCase().includes(term) ||
        c.financial_partner?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [commissions, period, statusFilter, typeFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const paid = commissions.filter(c => c.status === 'paid');
    const pending = commissions.filter(c => c.status === 'pending' || c.status === 'approved');
    
    const thisMonthPaid = paid.filter(c => new Date(c.payment_date || c.deal_date) >= thisMonthStart);
    const lastMonthPaid = paid.filter(c => {
      const date = new Date(c.payment_date || c.deal_date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });

    const totalPaid = paid.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPending = pending.reduce((sum, c) => sum + (c.amount || 0), 0);
    const thisMonthTotal = thisMonthPaid.reduce((sum, c) => sum + (c.amount || 0), 0);
    const lastMonthTotal = lastMonthPaid.reduce((sum, c) => sum + (c.amount || 0), 0);

    const monthChange = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : 0;

    // By product type
    const byProductType = {};
    paid.forEach(c => {
      const type = c.product_type || 'other';
      byProductType[type] = (byProductType[type] || 0) + (c.amount || 0);
    });

    // By financial partner
    const byPartner = {};
    paid.forEach(c => {
      const partner = c.financial_partner || 'Неизвестен';
      byPartner[partner] = (byPartner[partner] || 0) + (c.amount || 0);
    });

    return {
      totalPaid,
      totalPending,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      monthChange: parseFloat(monthChange),
      dealsCount: commissions.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      byProductType,
      byPartner
    };
  }, [commissions]);

  // Generate report
  const generateReport = () => {
    let reportData = commissions;
    const now = new Date();
    
    if (reportPeriod !== 'all') {
      const startDate = new Date();
      switch (reportPeriod) {
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      reportData = reportData.filter(c => new Date(c.deal_date) >= startDate);
    }

    // Create CSV content
    const headers = ['Дата', 'Клиент', 'Продукт', 'Тип продукт', 'Финансов партньор', 'Тип комисионна', 'Сума (EUR)', 'Статус', 'Дата на плащане'];
    const rows = reportData.map(c => [
      c.deal_date || '',
      c.client_name || '',
      c.product_name || '',
      productTypeLabels[c.product_type] || c.product_type || '',
      c.financial_partner || '',
      commissionTypeLabels[c.commission_type] || c.commission_type || '',
      c.amount || 0,
      statusConfig[c.status]?.label || c.status || '',
      c.payment_date || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commissions_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowReportDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Комисионни</h2>
          <p className="text-slate-500">Проследяване и отчетност на комисионни от финансови партньори</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowReportDialog(true)}
            className="rounded-xl"
          >
            <FileText className="h-4 w-4 mr-2" />
            Генерирай отчет
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl shadow-blue-500/20 overflow-hidden">
            <CardContent className="p-5 relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Общо изплатени</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPaid.toLocaleString('bg-BG')} €</p>
                  <p className="text-blue-200 text-xs mt-1">{stats.paidCount} сделки</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Този месец</p>
                  <p className="text-2xl font-bold mt-1 text-slate-900">{stats.thisMonth.toLocaleString('bg-BG')} €</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-sm font-medium",
                    stats.monthChange >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {stats.monthChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(stats.monthChange)}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Очакващи плащане</p>
                  <p className="text-2xl font-bold mt-1 text-slate-900">{stats.totalPending.toLocaleString('bg-BG')} €</p>
                  <p className="text-slate-400 text-xs mt-1">{stats.pendingCount} комисионни</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Миналия месец</p>
                  <p className="text-2xl font-bold mt-1 text-slate-900">{stats.lastMonth.toLocaleString('bg-BG')} €</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Търси по клиент, продукт или партньор..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl border-slate-200"
              />
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 rounded-xl">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="month">Този месец</SelectItem>
                <SelectItem value="quarter">Тримесечие</SelectItem>
                <SelectItem value="year">Тази година</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички статуси</SelectItem>
                <SelectItem value="pending">Очакващи</SelectItem>
                <SelectItem value="approved">Одобрени</SelectItem>
                <SelectItem value="paid">Изплатени</SelectItem>
                <SelectItem value="cancelled">Отказани</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 rounded-xl">
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички типове</SelectItem>
                <SelectItem value="initial">Първоначални</SelectItem>
                <SelectItem value="recurring">Периодични</SelectItem>
                <SelectItem value="bonus">Бонуси</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Commissions Table */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Детайлен списък
                <Badge variant="secondary" className="ml-2">{filteredCommissions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCommissions.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Няма намерени комисионни</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead>Дата</TableHead>
                        <TableHead>Клиент / Продукт</TableHead>
                        <TableHead>Партньор</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead className="text-right">Сума</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommissions.map((commission) => {
                        const StatusIcon = statusConfig[commission.status]?.icon || Clock;
                        return (
                          <TableRow key={commission.id} className="hover:bg-slate-50/50">
                            <TableCell className="text-slate-500 text-sm">
                              {commission.deal_date ? new Date(commission.deal_date).toLocaleDateString('bg-BG') : '-'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-900">{commission.client_name}</p>
                                <p className="text-sm text-slate-500">{commission.product_name}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="text-sm">{commission.financial_partner || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {commissionTypeLabels[commission.commission_type] || commission.commission_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-slate-900">
                              {(commission.amount || 0).toLocaleString('bg-BG')} €
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-xs", statusConfig[commission.status]?.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[commission.status]?.label || commission.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* By Product Type */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                По тип продукт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byProductType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, amount]) => {
                    const percent = stats.totalPaid > 0 ? (amount / stats.totalPaid * 100).toFixed(0) : 0;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{productTypeLabels[type] || type}</span>
                          <span className="text-slate-600">{amount.toLocaleString('bg-BG')} € ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(stats.byProductType).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">Няма данни</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* By Financial Partner */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                По финансов партньор
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byPartner)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([partner, amount]) => (
                    <div key={partner} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-700 text-sm">{partner}</span>
                      <span className="font-semibold text-slate-900">{amount.toLocaleString('bg-BG')} €</span>
                    </div>
                  ))}
                {Object.keys(stats.byPartner).length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">Няма данни</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Генериране на отчет
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Период</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Последен месец</SelectItem>
                  <SelectItem value="quarter">Последно тримесечие</SelectItem>
                  <SelectItem value="year">Последна година</SelectItem>
                  <SelectItem value="all">Всички данни</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowReportDialog(false)} className="flex-1">
                Отказ
              </Button>
              <Button onClick={generateReport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Изтегли CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}