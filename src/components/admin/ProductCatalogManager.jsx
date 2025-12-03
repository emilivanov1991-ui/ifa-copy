import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Package, DollarSign, Shield, Search, Copy, Download, ToggleLeft, ToggleRight, CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProductRateManager from './ProductRateManager';
import ProductCoverageManager from './ProductCoverageManager';
import ProductDocumentManager from './ProductDocumentManager';

// Export to CSV utility
const exportToCSV = (data, filename, columns) => {
  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(item => 
    columns.map(c => {
      const val = c.accessor(item);
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      if (Array.isArray(val)) return `"${val.join('; ')}"`;
      return val ?? '';
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const PRODUCT_TYPES = [
  { value: 'term_life', label: 'Срочна Застраховка Живот' },
  { value: 'ul_investment', label: 'Unit Linked Инвестиция' },
  { value: 'education_plan', label: 'Образователен План' },
  { value: 'health_insurance', label: 'Здравна Застраховка' },
  { value: 'critical_illness', label: 'Критични Заболявания' },
  { value: 'pension_plan', label: 'Пенсионен План' },
  { value: 'personal_accident', label: 'Злополука' },
  { value: 'property_insurance', label: 'Имуществена Застраховка' },
  { value: 'partners_regular', label: 'Partners Регулярна' },
  { value: 'partners_single', label: 'Partners Еднократна' },
  { value: 'travel_insurance', label: 'Туристическа Застраховка' },
  { value: 'car_insurance', label: 'Автомобилна Застраховка' },
  { value: 'home_insurance', label: 'Застраховка за Дома' },
  { value: 'mortgage_loan', label: 'Ипотечен Кредит' },
  { value: 'consumer_loan', label: 'Потребителски Кредит' },
  { value: 'business_insurance', label: 'Бизнес Застраховка' },
  { value: 'mountain_insurance', label: 'Планинска Застраховка' },
  { value: 'professional_liability', label: 'Професионална Отговорност' }
];

const CATEGORIES = [
  { value: 'protection', label: 'Защита' },
  { value: 'investment', label: 'Инвестиция' },
  { value: 'health', label: 'Здраве' },
  { value: 'pension', label: 'Пенсия' },
  { value: 'property', label: 'Имущество' },
  { value: 'children', label: 'Деца' },
  { value: 'travel', label: 'Пътуване' },
  { value: 'auto', label: 'Автомобил' },
  { value: 'home', label: 'Дом' },
  { value: 'loans', label: 'Кредити' },
  { value: 'business', label: 'Бизнес' }
];

const PROVIDERS = ['MetLife', 'UNIQA', 'Generali', 'Partners Investments', 'ОББ', 'ДЗИ', 'Allianz', 'GRAWE', 'Банка ДСК', 'Пощенска банка', 'УниКредит', 'Инстинкт'];

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(product || {
    provider: '',
    product_name: '',
    product_type: 'term_life',
    category: 'protection',
    min_age: 18,
    max_age: 65,
    min_term_years: 5,
    max_term_years: 40,
    min_monthly_premium: 30,
    currency: 'EUR',
    entry_fee_percent: 0,
    management_fee_percent: 0,
    smoker_multiplier: 1.5,
    tax_deductible: false,
    sellability_score: 5,
    is_active: true,
    features: [],
    target_profiles: [],
    description: '',
    sales_pitch: ''
  });

  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...(formData.features || []), newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Доставчик *</label>
          <Select value={formData.provider} onValueChange={(v) => setFormData({...formData, provider: v})}>
            <SelectTrigger><SelectValue placeholder="Избери доставчик" /></SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Име на продукта *</label>
          <Input value={formData.product_name} onChange={(e) => setFormData({...formData, product_name: e.target.value})} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Тип продукт *</label>
          <Select value={formData.product_type} onValueChange={(v) => setFormData({...formData, product_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Категория *</label>
          <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Мин. възраст</label>
          <Input type="number" value={formData.min_age} onChange={(e) => setFormData({...formData, min_age: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Макс. възраст</label>
          <Input type="number" value={formData.max_age} onChange={(e) => setFormData({...formData, max_age: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Мин. срок (год.)</label>
          <Input type="number" value={formData.min_term_years} onChange={(e) => setFormData({...formData, min_term_years: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Макс. срок (год.)</label>
          <Input type="number" value={formData.max_term_years} onChange={(e) => setFormData({...formData, max_term_years: Number(e.target.value)})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Мин. премия</label>
          <Input type="number" value={formData.min_monthly_premium} onChange={(e) => setFormData({...formData, min_monthly_premium: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Входна такса %</label>
          <Input type="number" step="0.1" value={formData.entry_fee_percent} onChange={(e) => setFormData({...formData, entry_fee_percent: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Такса управление %</label>
          <Input type="number" step="0.1" value={formData.management_fee_percent} onChange={(e) => setFormData({...formData, management_fee_percent: Number(e.target.value)})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Доходност конс. %</label>
          <Input type="number" step="0.1" value={formData.expected_return_conservative || ''} onChange={(e) => setFormData({...formData, expected_return_conservative: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Доходност балан. %</label>
          <Input type="number" step="0.1" value={formData.expected_return_balanced || ''} onChange={(e) => setFormData({...formData, expected_return_balanced: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Доходност динам. %</label>
          <Input type="number" step="0.1" value={formData.expected_return_dynamic || ''} onChange={(e) => setFormData({...formData, expected_return_dynamic: Number(e.target.value)})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Оценка продаваемост (1-10)</label>
          <Input type="number" min="1" max="10" value={formData.sellability_score} onChange={(e) => setFormData({...formData, sellability_score: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Комисионна %</label>
          <Input type="number" step="0.1" value={formData.commission_rate || ''} onChange={(e) => setFormData({...formData, commission_rate: Number(e.target.value)})} />
        </div>
        <div className="flex items-center gap-4 pt-6">
          <Switch checked={formData.tax_deductible} onCheckedChange={(v) => setFormData({...formData, tax_deductible: v})} />
          <span className="text-sm">Данъчно облекчение</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Характеристики</label>
        <div className="flex gap-2 mb-2">
          <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Добави характеристика" />
          <Button type="button" onClick={addFeature} size="sm">Добави</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.features || []).map((f, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {f}
              <button type="button" onClick={() => removeFeature(i)} className="ml-1 text-red-500">×</button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Описание</label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
      </div>

      <div>
        <label className="text-sm font-medium">Sales Pitch</label>
        <Textarea value={formData.sales_pitch || ''} onChange={(e) => setFormData({...formData, sales_pitch: e.target.value})} rows={2} placeholder="Кратко описание за продажба..." />
      </div>

      <div className="flex items-center gap-4">
        <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
        <span className="text-sm">Активен продукт</span>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Отказ</Button>
        <Button type="submit">Запази</Button>
      </div>
    </form>
  );
}

export default function ProductCatalogManager() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('products');
  const [selectedIds, setSelectedIds] = useState([]);
  const [generatingAI, setGeneratingAI] = useState({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productCatalog'],
    queryFn: () => base44.entities.ProductCatalog.list()
  });

  const { data: rates = [] } = useQuery({
    queryKey: ['productRates'],
    queryFn: () => base44.entities.ProductRate.list()
  });

  const { data: coverages = [] } = useQuery({
    queryKey: ['productCoverages'],
    queryFn: () => base44.entities.ProductCoverage.list()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['productDocuments'],
    queryFn: () => base44.entities.ProductDocument.list()
  });

  // Metrics
  const metrics = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalRates: rates.length,
    totalCoverages: coverages.length,
    totalDocuments: documents.length,
    providers: [...new Set(products.map(p => p.provider))].length
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductCatalog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      toast.success('Продуктът е създаден');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductCatalog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      toast.success('Продуктът е обновен');
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductCatalog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      toast.success('Продуктът е изтрит');
    }
  });

  // Bulk actions
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }) => {
      await Promise.all(ids.map(id => base44.entities.ProductCatalog.update(id, data)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      setSelectedIds([]);
      toast.success('Продуктите са обновени');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.ProductCatalog.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      setSelectedIds([]);
      toast.success('Продуктите са изтрити');
    }
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exportProducts = () => {
    const columns = [
      { label: 'Име', accessor: p => p.product_name },
      { label: 'Доставчик', accessor: p => p.provider },
      { label: 'Тип', accessor: p => p.product_type },
      { label: 'Категория', accessor: p => p.category },
      { label: 'Мин. възраст', accessor: p => p.min_age },
      { label: 'Макс. възраст', accessor: p => p.max_age },
      { label: 'Мин. премия', accessor: p => p.min_monthly_premium },
      { label: 'Валута', accessor: p => p.currency },
      { label: 'Продаваемост', accessor: p => p.sellability_score },
      { label: 'Активен', accessor: p => p.is_active ? 'Да' : 'Не' },
      { label: 'Характеристики', accessor: p => p.features }
    ];
    exportToCSV(products, 'products', columns);
    toast.success('Експортирано успешно');
  };

  const handleSave = (data) => {
    if (selectedProduct?.id) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (product) => {
    const { id, created_date, updated_date, created_by, ...rest } = product;
    setSelectedProduct({ ...rest, product_name: `${rest.product_name} (копие)` });
    setIsDialogOpen(true);
  };

  // AI Description Generator
  const generateAIDescription = async (product) => {
    setGeneratingAI(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const productType = PRODUCT_TYPES.find(t => t.value === product.product_type)?.label || product.product_type;
      const category = CATEGORIES.find(c => c.value === product.category)?.label || product.category;
      
      const prompt = `Генерирай професионално описание на български език за следния финансов продукт:

Продукт: ${product.product_name}
Доставчик: ${product.provider}
Тип: ${productType}
Категория: ${category}
Възрастов диапазон: ${product.min_age}-${product.max_age} години
Срок: ${product.min_term_years}-${product.max_term_years} години
Минимална премия: ${product.min_monthly_premium} ${product.currency}
Характеристики: ${(product.features || []).join(', ') || 'Няма'}
${product.tax_deductible ? 'Има данъчно облекчение' : ''}
${product.expected_return_conservative ? `Очаквана доходност консервативна: ${product.expected_return_conservative}%` : ''}
${product.expected_return_balanced ? `Очаквана доходност балансирана: ${product.expected_return_balanced}%` : ''}
${product.expected_return_dynamic ? `Очаквана доходност динамична: ${product.expected_return_dynamic}%` : ''}
${product.management_fee_percent ? `Такса управление: ${product.management_fee_percent}%` : ''}
${product.entry_fee_percent ? `Входна такса: ${product.entry_fee_percent}%` : ''}

Върни JSON обект със следните полета:
- description: Подробно описание на продукта (2-3 изречения)
- sales_pitch: Кратко и убедително описание за продажба (1-2 изречения)
- target_profiles: Масив от целеви профили на клиенти (напр. ["families", "high_income", "retirees"])
- risk_summary: Кратко описание на рисковия профил`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            sales_pitch: { type: "string" },
            target_profiles: { type: "array", items: { type: "string" } },
            risk_summary: { type: "string" }
          },
          required: ["description", "sales_pitch", "target_profiles"]
        }
      });

      // Update product with AI-generated content
      await base44.entities.ProductCatalog.update(product.id, {
        description: result.description,
        sales_pitch: result.sales_pitch,
        target_profiles: result.target_profiles
      });

      queryClient.invalidateQueries({ queryKey: ['productCatalog'] });
      toast.success(`Описанието за "${product.product_name}" е генерирано`);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Грешка при генериране на описание');
    } finally {
      setGeneratingAI(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Bulk AI Generation
  const bulkGenerateAI = async () => {
    const productsToGenerate = products.filter(p => selectedIds.includes(p.id));
    toast.info(`Генериране на описания за ${productsToGenerate.length} продукта...`);
    
    for (const product of productsToGenerate) {
      await generateAIDescription(product);
    }
    
    setSelectedIds([]);
    toast.success('Всички описания са генерирани');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.product_type === filterType;
    return matchesSearch && matchesType;
  });

  const getCategoryColor = (category) => {
    const colors = {
      protection: 'bg-red-100 text-red-800',
      investment: 'bg-green-100 text-green-800',
      health: 'bg-blue-100 text-blue-800',
      pension: 'bg-purple-100 text-purple-800',
      property: 'bg-amber-100 text-amber-800',
      children: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="p-6">
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalProducts}</p>
                <p className="text-xs text-slate-500">Общо продукти</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ToggleRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.activeProducts}</p>
                <p className="text-xs text-slate-500">Активни</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalRates}</p>
                <p className="text-xs text-slate-500">Тарифи</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalCoverages}</p>
                <p className="text-xs text-slate-500">Покрития</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.providers}</p>
                <p className="text-xs text-slate-500">Доставчици</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Продуктов Каталог</h1>
          <p className="text-slate-500">Управление на финансови продукти, тарифи и покрития</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProducts} className="gap-2">
            <Download className="w-4 h-4" />
            Експорт
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedProduct(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Нов Продукт
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedProduct?.id ? 'Редактиране на продукт' : 'Нов продукт'}</DialogTitle>
              </DialogHeader>
              <ProductForm 
                product={selectedProduct} 
                onSave={handleSave} 
                onCancel={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Продукти ({products.length})
          </TabsTrigger>
          <TabsTrigger value="rates" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Тарифи ({rates.length})
          </TabsTrigger>
          <TabsTrigger value="coverages" className="gap-2">
            <Shield className="w-4 h-4" />
            Покрития ({coverages.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <Package className="w-4 h-4" />
            Документи ({documents.length})
          </TabsTrigger>
          </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Търси по име или доставчик..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Филтър по тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички типове</SelectItem>
                {PRODUCT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                {selectedIds.length} избрани
              </span>
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { is_active: true } })}
                  className="gap-1"
                >
                  <ToggleRight className="w-4 h-4" />
                  Активирай
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { is_active: false } })}
                  className="gap-1"
                >
                  <ToggleLeft className="w-4 h-4" />
                  Деактивирай
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={bulkGenerateAI}
                  className="gap-1 text-violet-600 hover:text-violet-700"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Описания
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (confirm(`Сигурни ли сте, че искате да изтриете ${selectedIds.length} продукта?`)) {
                      bulkDeleteMutation.mutate(selectedIds);
                    }
                  }}
                  className="gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Изтрий
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  Отмени
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Зареждане...</div>
          ) : (
            <div className="grid gap-4">
              {/* Select All Header */}
              <div className="flex items-center gap-2 px-2">
                <Checkbox 
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-slate-500">Избери всички</span>
              </div>

              {filteredProducts.map(product => (
                <Card key={product.id} className={`${!product.is_active ? 'opacity-50' : ''} ${selectedIds.includes(product.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => toggleSelect(product.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{product.product_name}</h3>
                          <Badge className={getCategoryColor(product.category)}>
                            {CATEGORIES.find(c => c.value === product.category)?.label}
                          </Badge>
                          {!product.is_active && <Badge variant="outline">Неактивен</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{product.provider}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span>Възраст: {product.min_age}-{product.max_age}</span>
                          <span>Срок: {product.min_term_years}-{product.max_term_years} год.</span>
                          <span>Мин. премия: {product.min_monthly_premium} {product.currency}</span>
                          <span>Продаваемост: {product.sellability_score}/10</span>
                        </div>
                        {product.features?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.features.slice(0, 3).map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                            ))}
                            {product.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{product.features.length - 3}</Badge>
                            )}
                          </div>
                        )}
                        {product.sales_pitch && (
                          <p className="text-sm text-slate-600 mt-2 italic border-l-2 border-violet-300 pl-2">
                            {product.sales_pitch}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => generateAIDescription(product)}
                          disabled={generatingAI[product.id]}
                          title="Генерирай AI описание"
                        >
                          {generatingAI[product.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-violet-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(product)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Няма намерени продукти
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <ProductRateManager />
        </TabsContent>

        <TabsContent value="coverages" className="mt-4">
        <ProductCoverageManager />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
        <ProductDocumentManager />
        </TabsContent>
        </Tabs>
    </div>
  );
}