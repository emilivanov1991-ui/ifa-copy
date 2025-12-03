import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const RATE_TYPES = [
  { value: 'age_based', label: 'По възраст' },
  { value: 'term_based', label: 'По срок' },
  { value: 'coverage_based', label: 'По покритие' },
  { value: 'flat', label: 'Фиксирана' },
  { value: 'tiered', label: 'Стъпаловидна' }
];

const GENDERS = [
  { value: 'any', label: 'Всички' },
  { value: 'male', label: 'Мъже' },
  { value: 'female', label: 'Жени' }
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Месечна' },
  { value: 'quarterly', label: 'Тримесечна' },
  { value: 'semiannual', label: 'Шестмесечна' },
  { value: 'annual', label: 'Годишна' }
];

function RateForm({ rate, products, onSave, onCancel }) {
  const [formData, setFormData] = useState(rate || {
    catalog_product_id: '',
    rate_type: 'age_based',
    age_from: 18,
    age_to: 65,
    term_years: null,
    gender: 'any',
    is_smoker: false,
    risk_class: 1,
    rate_per_1000: null,
    flat_rate: null,
    coefficient: null,
    min_premium: null,
    max_premium: null,
    frequency: 'annual',
    notes: '',
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.catalog_product_id) {
      toast.error('Моля изберете продукт');
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
          <label className="text-sm font-medium">Тип тарифа *</label>
          <Select value={formData.rate_type} onValueChange={(v) => setFormData({...formData, rate_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RATE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Честота</label>
          <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Възраст от</label>
          <Input type="number" value={formData.age_from || ''} onChange={(e) => setFormData({...formData, age_from: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Възраст до</label>
          <Input type="number" value={formData.age_to || ''} onChange={(e) => setFormData({...formData, age_to: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-sm font-medium">Срок (години)</label>
          <Input type="number" value={formData.term_years || ''} onChange={(e) => setFormData({...formData, term_years: Number(e.target.value) || null})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Пол</label>
          <Select value={formData.gender || 'any'} onValueChange={(v) => setFormData({...formData, gender: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Рисков клас</label>
          <Select value={String(formData.risk_class || 1)} onValueChange={(v) => setFormData({...formData, risk_class: Number(v)})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">I клас</SelectItem>
              <SelectItem value="2">II клас</SelectItem>
              <SelectItem value="3">III клас</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4 pt-6">
          <Switch checked={formData.is_smoker || false} onCheckedChange={(v) => setFormData({...formData, is_smoker: v})} />
          <span className="text-sm">Пушач</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Тарифа на 1000</label>
          <Input type="number" step="0.01" value={formData.rate_per_1000 || ''} onChange={(e) => setFormData({...formData, rate_per_1000: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Фиксирана тарифа</label>
          <Input type="number" step="0.01" value={formData.flat_rate || ''} onChange={(e) => setFormData({...formData, flat_rate: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Коефициент</label>
          <Input type="number" step="0.0001" value={formData.coefficient || ''} onChange={(e) => setFormData({...formData, coefficient: Number(e.target.value) || null})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Мин. премия</label>
          <Input type="number" step="0.01" value={formData.min_premium || ''} onChange={(e) => setFormData({...formData, min_premium: Number(e.target.value) || null})} />
        </div>
        <div>
          <label className="text-sm font-medium">Макс. премия</label>
          <Input type="number" step="0.01" value={formData.max_premium || ''} onChange={(e) => setFormData({...formData, max_premium: Number(e.target.value) || null})} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Бележки</label>
        <Input value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
      </div>

      <div className="flex items-center gap-4">
        <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
        <span className="text-sm">Активна тарифа</span>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Отказ</Button>
        <Button type="submit">Запази</Button>
      </div>
    </form>
  );
}

export default function ProductRateManager() {
  const queryClient = useQueryClient();
  const [selectedRate, setSelectedRate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: products = [] } = useQuery({
    queryKey: ['productCatalog'],
    queryFn: () => base44.entities.ProductCatalog.list()
  });

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['productRates'],
    queryFn: () => base44.entities.ProductRate.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductRate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productRates'] });
      toast.success('Тарифата е създадена');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductRate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productRates'] });
      toast.success('Тарифата е обновена');
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductRate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productRates'] });
      toast.success('Тарифата е изтрита');
    }
  });

  const handleSave = (data) => {
    if (selectedRate?.id) {
      updateMutation.mutate({ id: selectedRate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.product_name} (${product.provider})` : 'Неизвестен';
  };

  const filteredRates = rates.filter(r => {
    const product = products.find(p => p.id === r.catalog_product_id);
    const matchesSearch = product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === 'all' || r.catalog_product_id === filterProduct;
    const matchesType = filterType === 'all' || r.rate_type === filterType;
    return matchesSearch && matchesProduct && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Тарифни Таблици</h2>
        <Button onClick={() => { setSelectedRate(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Нова Тарифа
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Търси..."
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
            <SelectValue placeholder="Тип тарифа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички типове</SelectItem>
            {RATE_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Зареждане...</div>
      ) : filteredRates.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Няма намерени тарифи</div>
      ) : (
        <div className="space-y-2">
          {filteredRates.map(rate => (
            <Card key={rate.id} className={`${!rate.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getProductName(rate.catalog_product_id)}</span>
                      <Badge variant="outline" className="text-xs">
                        {RATE_TYPES.find(t => t.value === rate.rate_type)?.label}
                      </Badge>
                      {rate.is_smoker && <Badge className="bg-amber-100 text-amber-800 text-xs">Пушач</Badge>}
                      {!rate.is_active && <Badge variant="outline" className="text-xs">Неактивна</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {rate.age_from && <span>Възраст: {rate.age_from}-{rate.age_to}</span>}
                      {rate.term_years && <span>Срок: {rate.term_years} год.</span>}
                      {rate.gender !== 'any' && <span>Пол: {GENDERS.find(g => g.value === rate.gender)?.label}</span>}
                      <span>Клас: {rate.risk_class}</span>
                      {rate.rate_per_1000 && <span className="font-medium text-slate-700">{rate.rate_per_1000}/1000</span>}
                      {rate.flat_rate && <span className="font-medium text-slate-700">{rate.flat_rate} фиксирана</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedRate(rate); setIsDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rate.id)}>
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
            <DialogTitle>{selectedRate?.id ? 'Редактиране на тарифа' : 'Нова тарифа'}</DialogTitle>
          </DialogHeader>
          <RateForm
            rate={selectedRate}
            products={products}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}