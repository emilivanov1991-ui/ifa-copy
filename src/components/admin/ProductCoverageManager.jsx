import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const COVERAGE_TYPES = [
  { value: 'death', label: 'Смърт' },
  { value: 'accident', label: 'Злополука' },
  { value: 'disability', label: 'Инвалидност' },
  { value: 'critical_illness', label: 'Критични заболявания' },
  { value: 'hospital', label: 'Болнично лечение' },
  { value: 'surgery', label: 'Хирургия' },
  { value: 'dental', label: 'Дентално' },
  { value: 'outpatient', label: 'Амбулаторно' },
  { value: 'other', label: 'Друго' }
];

function CoverageForm({ coverage, products, onSave, onCancel }) {
  const [formData, setFormData] = useState(coverage || {
    catalog_product_id: '',
    coverage_name: '',
    coverage_code: '',
    coverage_type: 'death',
    is_included: false,
    is_optional: true,
    min_amount: null,
    max_amount: null,
    default_amount: null,
    rate_per_1000: null,
    extra_premium_percent: null,
    flat_premium: null,
    age_restrictions: { min_age: null, max_age: null },
    description: '',
    display_order: 100,
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.catalog_product_id || !formData.coverage_name) {
      toast.error('Моля попълнете задължителните полета');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div>
        <label className="text-sm font-medium">Продукт *</label>
        <Select value={formData.catalog_product_id} onValueChange={(v) => setFormData({...formData, catalog_product_id: v})}>
          <SelectTrigger><SelectValue placeholder="Избери продукт" /></SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.product_name} ({p.provider})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Име на покритието *</label>
          <Input value={formData.coverage_name} onChange={(e) => setFormData({...formData, coverage_name: e.target.value})} required />
        </div>
        <div>
          <label className="text-sm font-medium">Код</label>
          <Input value={formData.coverage_code || ''} onChange={(e) => setFormData({...formData, coverage_code: e.target.value})} placeholder="напр. DEATH_ACC" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Тип покритие *</label>
          <Select value={formData.coverage_type} onValueChange={(v) => setFormData({...formData, coverage_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COVERAGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Подреждане</label>
          <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})} />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_included} onCheckedChange={(v) => setFormData({...formData, is_included: v})} />
          <span className="text-sm">Включено в основната цена</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={formData.is_optional} onCheckedChange={(v) => setFormData({...formData, is_optional: v})} />
          <span className="text-sm">Опционално</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Мин. сума</label>
          <Input type="number" value={formData.min_amount || ''} onChange={(e) => setFormData({...formData, min_amount: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Макс. сума</label>
          <Input type="number" value={formData.max_amount || ''} onChange={(e) => setFormData({...formData, max_amount: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">По подразбиране</label>
          <Input type="number" value={formData.default_amount || ''} onChange={(e) => setFormData({...formData, default_amount: Number(e.target.value) || null})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Тарифа на 1000</label>
          <Input type="number" step="0.01" value={formData.rate_per_1000 || ''} onChange={(e) => setFormData({...formData, rate_per_1000: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Добавка %</label>
          <Input type="number" step="0.1" value={formData.extra_premium_percent || ''} onChange={(e) => setFormData({...formData, extra_premium_percent: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Фиксирана добавка</label>
          <Input type="number" step="0.01" value={formData.flat_premium || ''} onChange={(e) => setFormData({...formData, flat_premium: Number(e.target.value) || null})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Мин. възраст</label>
          <Input type="number" value={formData.age_restrictions?.min_age || ''} onChange={(e) => setFormData({...formData, age_restrictions: {...formData.age_restrictions, min_age: Number(e.target.value) || null}})} />
        </div>
        <div>
          <label className="text-sm font-medium">Макс. възраст</label>
          <Input type="number" value={formData.age_restrictions?.max_age || ''} onChange={(e) => setFormData({...formData, age_restrictions: {...formData.age_restrictions, max_age: Number(e.target.value) || null}})} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Описание</label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
      </div>

      <div className="flex items-center gap-4">
        <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
        <span className="text-sm">Активно покритие</span>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Отказ</Button>
        <Button type="submit">Запази</Button>
      </div>
    </form>
  );
}

export default function ProductCoverageManager() {
  const queryClient = useQueryClient();
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: products = [] } = useQuery({
    queryKey: ['productCatalog'],
    queryFn: () => base44.entities.ProductCatalog.list()
  });

  const { data: coverages = [], isLoading } = useQuery({
    queryKey: ['productCoverages'],
    queryFn: () => base44.entities.ProductCoverage.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductCoverage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCoverages'] });
      toast.success('Покритието е създадено');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductCoverage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCoverages'] });
      toast.success('Покритието е обновено');
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductCoverage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCoverages'] });
      toast.success('Покритието е изтрито');
    }
  });

  const handleSave = (data) => {
    if (selectedCoverage?.id) {
      updateMutation.mutate({ id: selectedCoverage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.product_name}` : 'Неизвестен';
  };

  const filteredCoverages = coverages.filter(c => {
    const matchesSearch = c.coverage_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.coverage_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === 'all' || c.catalog_product_id === filterProduct;
    const matchesType = filterType === 'all' || c.coverage_type === filterType;
    return matchesSearch && matchesProduct && matchesType;
  });

  const getCoverageTypeColor = (type) => {
    const colors = {
      death: 'bg-red-100 text-red-800',
      accident: 'bg-orange-100 text-orange-800',
      disability: 'bg-purple-100 text-purple-800',
      critical_illness: 'bg-pink-100 text-pink-800',
      hospital: 'bg-blue-100 text-blue-800',
      surgery: 'bg-cyan-100 text-cyan-800',
      dental: 'bg-green-100 text-green-800',
      outpatient: 'bg-teal-100 text-teal-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Покрития</h2>
        <Button onClick={() => { setSelectedCoverage(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Ново Покритие
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Търси по име или код..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Филтър по продукт" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички продукти</SelectItem>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.product_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Тип покритие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички типове</SelectItem>
            {COVERAGE_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Зареждане...</div>
      ) : filteredCoverages.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Shield className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          Няма намерени покрития
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCoverages.map(cov => (
            <Card key={cov.id} className={`${!cov.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{cov.coverage_name}</span>
                      {cov.coverage_code && <Badge variant="outline" className="text-xs">{cov.coverage_code}</Badge>}
                      <Badge className={`text-xs ${getCoverageTypeColor(cov.coverage_type)}`}>
                        {COVERAGE_TYPES.find(t => t.value === cov.coverage_type)?.label}
                      </Badge>
                      {cov.is_included && (
                        <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Включено
                        </Badge>
                      )}
                      {!cov.is_active && <Badge variant="outline" className="text-xs">Неактивно</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="text-slate-400">{getProductName(cov.catalog_product_id)}</span>
                      {cov.min_amount && <span>Мин: {cov.min_amount?.toLocaleString()}</span>}
                      {cov.max_amount && <span>Макс: {cov.max_amount?.toLocaleString()}</span>}
                      {cov.rate_per_1000 && <span className="font-medium text-slate-700">{cov.rate_per_1000}/1000</span>}
                      {cov.flat_premium && <span className="font-medium text-slate-700">+{cov.flat_premium} фикс.</span>}
                      {cov.extra_premium_percent && <span className="font-medium text-slate-700">+{cov.extra_premium_percent}%</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedCoverage(cov); setIsDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cov.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCoverage?.id ? 'Редактиране на покритие' : 'Ново покритие'}</DialogTitle>
          </DialogHeader>
          <CoverageForm
            coverage={selectedCoverage}
            products={products}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}