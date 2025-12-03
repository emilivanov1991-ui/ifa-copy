import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, Upload, Download, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'terms_conditions', label: 'Общи условия' },
  { value: 'factsheet', label: 'Factsheet' },
  { value: 'kid', label: 'Основен информационен документ (KID)' },
  { value: 'brochure', label: 'Брошура' },
  { value: 'application_form', label: 'Формуляр за кандидатстване' },
  { value: 'tariff', label: 'Тарифа' },
  { value: 'other', label: 'Друго' }
];

function DocumentForm({ document, products, onSave, onCancel }) {
  const [formData, setFormData] = useState(document || {
    catalog_product_id: '',
    document_type: 'terms_conditions',
    document_name: '',
    file_url: '',
    version: '',
    language: 'bg',
    is_active: true,
    notes: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url, document_name: formData.document_name || file.name });
      toast.success('Файлът е качен успешно');
    } catch (error) {
      toast.error('Грешка при качване на файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.catalog_product_id || !formData.document_name) {
      toast.error('Моля попълнете задължителните полета');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Продукт *</label>
        <Select value={formData.catalog_product_id} onValueChange={(v) => setFormData({...formData, catalog_product_id: v})}>
          <SelectTrigger><SelectValue placeholder="Избери продукт" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.product_name} ({p.provider})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Тип документ *</label>
          <Select value={formData.document_type} onValueChange={(v) => setFormData({...formData, document_type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Език</label>
          <Select value={formData.language} onValueChange={(v) => setFormData({...formData, language: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bg">Български</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Име на документа *</label>
        <Input value={formData.document_name} onChange={(e) => setFormData({...formData, document_name: e.target.value})} required />
      </div>

      <div>
        <label className="text-sm font-medium">Файл</label>
        <div className="flex gap-2">
          <Input 
            value={formData.file_url} 
            onChange={(e) => setFormData({...formData, file_url: e.target.value})} 
            placeholder="URL или качете файл"
            className="flex-1"
          />
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            <Button type="button" variant="outline" disabled={isUploading} asChild>
              <span><Upload className="w-4 h-4 mr-1" />{isUploading ? 'Качване...' : 'Качи'}</span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Версия</label>
          <Input value={formData.version || ''} onChange={(e) => setFormData({...formData, version: e.target.value})} placeholder="1.0" />
        </div>
        <div>
          <label className="text-sm font-medium">Валиден от</label>
          <Input type="date" value={formData.valid_from || ''} onChange={(e) => setFormData({...formData, valid_from: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Бележки</label>
        <Input value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Отказ</Button>
        <Button type="submit">Запази</Button>
      </div>
    </form>
  );
}

export default function ProductDocumentManager({ productId = null }) {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState(productId || 'all');
  const [filterType, setFilterType] = useState('all');

  const { data: products = [] } = useQuery({
    queryKey: ['productCatalog'],
    queryFn: () => base44.entities.ProductCatalog.list()
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['productDocuments'],
    queryFn: () => base44.entities.ProductDocument.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productDocuments'] });
      toast.success('Документът е добавен');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductDocument.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productDocuments'] });
      toast.success('Документът е обновен');
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProductDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productDocuments'] });
      toast.success('Документът е изтрит');
    }
  });

  const handleSave = (data) => {
    if (selectedDoc?.id) {
      updateMutation.mutate({ id: selectedDoc.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.product_name : 'Неизвестен';
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.document_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === 'all' || d.catalog_product_id === filterProduct;
    const matchesType = filterType === 'all' || d.document_type === filterType;
    return matchesSearch && matchesProduct && matchesType;
  });

  const getTypeColor = (type) => {
    const colors = {
      terms_conditions: 'bg-blue-100 text-blue-800',
      factsheet: 'bg-green-100 text-green-800',
      kid: 'bg-purple-100 text-purple-800',
      brochure: 'bg-amber-100 text-amber-800',
      application_form: 'bg-slate-100 text-slate-800',
      tariff: 'bg-red-100 text-red-800',
      other: 'bg-slate-100 text-slate-600'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Документи ({documents.length})</h2>
        <Button onClick={() => { setSelectedDoc(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Нов документ
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Търси..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Продукт" /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">Всички продукти</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.product_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички типове</SelectItem>
            {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Зареждане...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          Няма намерени документи
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map(doc => (
            <Card key={doc.id} className={!doc.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doc.document_name}</span>
                        <Badge className={getTypeColor(doc.document_type)}>
                          {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                        </Badge>
                        {doc.version && <Badge variant="outline">v{doc.version}</Badge>}
                      </div>
                      <p className="text-sm text-slate-500">{getProductName(doc.catalog_product_id)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {doc.file_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedDoc(doc); setIsDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(doc.id)}>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.id ? 'Редактиране' : 'Нов документ'}</DialogTitle>
          </DialogHeader>
          <DocumentForm 
            document={selectedDoc} 
            products={products}
            onSave={handleSave} 
            onCancel={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}