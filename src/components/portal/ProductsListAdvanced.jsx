import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  PiggyBank, 
  Wallet, 
  Landmark, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Calendar,
  Percent,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const productIcons = {
  investment: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  insurance: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
  pension: { icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100' },
  savings: { icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-100' },
  loan: { icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100' },
};

const productLabels = {
  investment: 'Инвестиция',
  insurance: 'Застраховка',
  pension: 'Пенсионен',
  savings: 'Спестовен',
  loan: 'Кредит',
};

const riskLabels = {
  conservative: { label: 'Консервативен', color: 'bg-green-100 text-green-700' },
  moderate: { label: 'Умерен', color: 'bg-blue-100 text-blue-700' },
  balanced: { label: 'Балансиран', color: 'bg-amber-100 text-amber-700' },
  dynamic: { label: 'Динамичен', color: 'bg-orange-100 text-orange-700' },
  aggressive: { label: 'Агресивен', color: 'bg-red-100 text-red-700' },
};

const currencySymbols = {
  EUR: '€',
  BGN: 'лв.',
  USD: '$',
};

export default function ProductsListAdvanced({ products }) {
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  // Generate ICS calendar event
  const generateICS = (product) => {
    if (!product.maturity_date) return;
    
    const date = new Date(product.maturity_date);
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APEX Financial//Client Portal//BG
BEGIN:VEVENT
UID:${product.id}@apex-financial.bg
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(date)}
DTEND:${formatDate(new Date(date.getTime() + 3600000))}
SUMMARY:Падеж: ${product.name}
DESCRIPTION:Падеж на финансов продукт "${product.name}" от ${product.provider || 'N/A'}. Текуща стойност: ${product.current_value?.toLocaleString()} ${currencySymbols[product.currency] || '€'}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name}-maturity.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(p => p.type === filterType);
    }
    
    // Filter by risk
    if (filterRisk !== 'all') {
      result = result.filter(p => p.risk_profile === filterRisk);
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'value':
          comparison = (a.current_value || 0) - (b.current_value || 0);
          break;
        case 'date':
          comparison = new Date(a.start_date || 0) - new Date(b.start_date || 0);
          break;
        case 'return':
          comparison = (a.expected_return || 0) - (b.expected_return || 0);
          break;
        case 'risk':
          const riskOrder = { conservative: 1, moderate: 2, balanced: 3, dynamic: 4, aggressive: 5 };
          comparison = (riskOrder[a.risk_profile] || 3) - (riskOrder[b.risk_profile] || 3);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [products, filterType, filterRisk, sortBy, sortOrder]);

  // Calculate performance
  const calculatePerformance = (product) => {
    if (!product.initial_value || !product.current_value) return null;
    return ((product.current_value - product.initial_value) / product.initial_value * 100).toFixed(2);
  };

  if (products.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Няма активни продукти</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Тип продукт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички типове</SelectItem>
                {Object.entries(productLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Рисков профил" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички рискове</SelectItem>
              {Object.entries(riskLabels).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Сортирай по" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Име</SelectItem>
              <SelectItem value="value">Стойност</SelectItem>
              <SelectItem value="date">Дата</SelectItem>
              <SelectItem value="return">Доходност</SelectItem>
              <SelectItem value="risk">Риск</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700">Общо продукти</p>
            <p className="text-2xl font-bold text-blue-900">{filteredProducts.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-4">
            <p className="text-sm text-green-700">Обща стойност</p>
            <p className="text-2xl font-bold text-green-900">
              {filteredProducts.reduce((s, p) => s + (p.current_value || 0), 0).toLocaleString('bg-BG')} €
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-700">Месечни вноски</p>
            <p className="text-2xl font-bold text-amber-900">
              {filteredProducts.reduce((s, p) => s + (p.monthly_premium || 0), 0).toLocaleString('bg-BG')} €
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-4">
            <p className="text-sm text-purple-700">Ср. очаквана доходност</p>
            <p className="text-2xl font-bold text-purple-900">
              {(filteredProducts.reduce((s, p) => s + (p.expected_return || 0), 0) / filteredProducts.length || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const config = productIcons[product.type] || productIcons.investment;
          const Icon = config.icon;
          const isExpanded = expandedId === product.id;
          const performance = calculatePerformance(product);
          const currency = currencySymbols[product.currency] || '€';
          
          return (
            <Card 
              key={product.id} 
              className="bg-white hover:shadow-lg transition-all"
            >
              <CardContent className="py-4">
                {/* Main Row */}
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                    <Icon className={cn("h-6 w-6", config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{product.name}</h3>
                      <Badge variant="outline">{productLabels[product.type]}</Badge>
                      {product.risk_profile && (
                        <Badge className={riskLabels[product.risk_profile]?.color}>
                          {riskLabels[product.risk_profile]?.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{product.provider}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-slate-900">
                      {(product.current_value || 0).toLocaleString('bg-BG')} {currency}
                    </p>
                    {performance !== null && (
                      <p className={cn(
                        "text-sm flex items-center justify-end gap-1",
                        parseFloat(performance) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {parseFloat(performance) >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {performance}%
                      </p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Dates */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Дати
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Придобиване:</span>
                            <span className="font-medium">
                              {product.start_date ? new Date(product.start_date).toLocaleDateString('bg-BG') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Падеж:</span>
                            <span className="font-medium">
                              {product.maturity_date ? new Date(product.maturity_date).toLocaleDateString('bg-BG') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        {product.maturity_date && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateICS(product);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Експорт в календар
                          </Button>
                        )}
                      </div>
                      
                      {/* Financial Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Финансови данни
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Начална стойност:</span>
                            <span className="font-medium">{(product.initial_value || 0).toLocaleString('bg-BG')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Текуща стойност:</span>
                            <span className="font-medium">{(product.current_value || 0).toLocaleString('bg-BG')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Месечна вноска:</span>
                            <span className="font-medium">{(product.monthly_premium || 0).toLocaleString('bg-BG')} {currency}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Performance */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Доходност и такси
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Очаквана доходност:</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="font-medium text-green-600 flex items-center gap-1">
                                    {product.expected_return || 0}%
                                    <Info className="h-3 w-3" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Очаквана годишна доходност</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Такса управление:</span>
                            <span className="font-medium">{product.management_fee || 0}% годишно</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Лихва:</span>
                            <span className="font-medium">{product.interest_rate || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Risk & Coverage */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-700 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Риск и покритие
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Рисков профил:</span>
                            <Badge className={riskLabels[product.risk_profile]?.color || 'bg-slate-100'}>
                              {riskLabels[product.risk_profile]?.label || 'N/A'}
                            </Badge>
                          </div>
                          {product.coverage_amount && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Покритие:</span>
                              <span className="font-medium">{product.coverage_amount.toLocaleString('bg-BG')} {currency}</span>
                            </div>
                          )}
                        </div>
                        {product.coverage_details && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                            {product.coverage_details}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {product.notes && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{product.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}