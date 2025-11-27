import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FolderOpen,
  Plus,
  X,
  Loader2,
  Shield,
  FileCheck,
  CreditCard,
  User,
  Receipt,
  File
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CATEGORIES = {
  policy: { label: 'Полица', icon: Shield, color: 'bg-blue-100 text-blue-700' },
  contract: { label: 'Договор', icon: FileCheck, color: 'bg-purple-100 text-purple-700' },
  certificate: { label: 'Удостоверение', icon: FileText, color: 'bg-green-100 text-green-700' },
  id_document: { label: 'Лични документи', icon: User, color: 'bg-amber-100 text-amber-700' },
  financial_statement: { label: 'Финансов отчет', icon: CreditCard, color: 'bg-indigo-100 text-indigo-700' },
  tax_document: { label: 'Данъчен документ', icon: Receipt, color: 'bg-red-100 text-red-700' },
  other: { label: 'Други', icon: File, color: 'bg-slate-100 text-slate-700' },
};

export default function DocumentsManager({ clientId }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: '',
    expiry_date: '',
    notes: '',
    file: null
  });

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', clientId],
    queryFn: () => base44.entities.ClientDocument.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', clientId] });
      setShowUploadDialog(false);
      setNewDocument({ name: '', category: '', expiry_date: '', notes: '', file: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', clientId] });
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(prev => ({ 
        ...prev, 
        file,
        name: prev.name || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleUpload = async () => {
    if (!newDocument.file || !newDocument.category) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: newDocument.file });
      
      await createMutation.mutateAsync({
        client_id: clientId,
        name: newDocument.name,
        category: newDocument.category,
        file_url,
        expiry_date: newDocument.expiry_date || undefined,
        notes: newDocument.notes || undefined,
        status: 'active'
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const getDocumentStatus = (doc) => {
    if (!doc.expiry_date) return 'active';
    const expiry = new Date(doc.expiry_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiry < today) return 'expired';
    if (expiry <= thirtyDaysFromNow) return 'expiring';
    return 'active';
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const expiringCount = documents.filter(doc => getDocumentStatus(doc) === 'expiring').length;
  const expiredCount = documents.filter(doc => getDocumentStatus(doc) === 'expired').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Документи</h2>
          <p className="text-sm text-slate-600">Управлявайте вашите финансови документи</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Качи документ
        </Button>
      </div>

      {/* Alerts */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">{expiredCount} изтекли документа</span>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">{expiringCount} документа изтичат скоро</span>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className="rounded-full"
        >
          Всички ({documents.length})
        </Button>
        {Object.entries(CATEGORIES).map(([key, { label }]) => {
          const count = documents.filter(d => d.category === key).length;
          if (count === 0) return null;
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="rounded-full"
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Няма качени документи</p>
            <Button 
              variant="link" 
              onClick={() => setShowUploadDialog(true)}
              className="text-blue-600 mt-2"
            >
              Качете първия си документ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const status = getDocumentStatus(doc);
            const CategoryIcon = CATEGORIES[doc.category]?.icon || File;
            const categoryInfo = CATEGORIES[doc.category] || CATEGORIES.other;
            
            return (
              <Card key={doc.id} className={cn(
                "bg-white hover:shadow-md transition-shadow",
                status === 'expired' && "border-red-200",
                status === 'expiring' && "border-amber-200"
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-lg", categoryInfo.color)}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      {status === 'expired' && (
                        <Badge variant="destructive" className="text-xs">Изтекъл</Badge>
                      )}
                      {status === 'expiring' && (
                        <Badge className="bg-amber-500 text-xs">Изтича скоро</Badge>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-slate-900 mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{categoryInfo.label}</p>
                  
                  {doc.expiry_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>Валидност: {new Date(doc.expiry_date).toLocaleDateString('bg-BG')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Изтегли
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Качване на документ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Файл <span className="text-red-500">*</span></Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500">PDF, Word или изображение (макс. 10MB)</p>
            </div>

            <div className="space-y-2">
              <Label>Име на документа <span className="text-red-500">*</span></Label>
              <Input
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Напр. Застраховка Живот 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Категория <span className="text-red-500">*</span></Label>
              <Select 
                value={newDocument.category} 
                onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете категория" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата на изтичане (ако е приложимо)</Label>
              <Input
                type="date"
                value={newDocument.expiry_date}
                onChange={(e) => setNewDocument(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Бележки</Label>
              <Textarea
                value={newDocument.notes}
                onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Допълнителна информация..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Отказ
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!newDocument.file || !newDocument.category || !newDocument.name || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Качване...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Качи
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}