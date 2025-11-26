import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function LeadImportDialog({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);

  const expectedColumns = [
    'Фамилия', 'Име', 'Общ познат', 'Социална мрежа', 
    'Телефонен номер', 'Email', 'Връзка откъде?', 'Град', 'Клиент или Рекрютинг'
  ];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('Моля, изберете Excel или CSV файл');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lastName: { type: "string", description: "Фамилия" },
              firstName: { type: "string", description: "Име" },
              referrer: { type: "string", description: "Общ познат" },
              socialNetwork: { type: "string", description: "Социална мрежа" },
              phone: { type: "string", description: "Телефонен номер" },
              email: { type: "string", description: "Email" },
              additionalInfo: { type: "string", description: "Връзка откъде" },
              city: { type: "string", description: "Град" },
              leadType: { type: "string", description: "Клиент или Рекрютинг" }
            }
          }
        }
      });

      if (result.status === 'success' && result.output) {
        const leads = result.output.map((row, idx) => ({
          id: `import_${Date.now()}_${idx}`,
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          name: `${row.firstName || ''} ${row.lastName || ''}`.trim(),
          referrer: row.referrer || '',
          socialNetwork: row.socialNetwork || '',
          phone: row.phone || '',
          email: row.email || '',
          additionalInfo: row.additionalInfo || '',
          city: row.city || '',
          leadType: row.leadType?.toLowerCase().includes('рекрут') ? 'recruiting' : 'client',
          type: 'lead',
          status: 'new',
          score: 50,
          products: 0,
          value: 0,
          tasks: [],
          reminders: [],
          communications: [],
          createdAt: new Date().toISOString()
        }));

        setPreviewData(leads.filter(l => l.name.trim()));
        setErrors([]);
      } else {
        setErrors([result.details || 'Грешка при обработка на файла']);
      }
    } catch (error) {
      console.error('Import error:', error);
      setErrors(['Грешка при импортиране на файла']);
    }

    setIsUploading(false);
  };

  const handleImport = () => {
    if (!previewData || previewData.length === 0) return;
    onImport(previewData);
    toast.success(`${previewData.length} лийда са импортирани успешно`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setErrors([]);
    onClose();
  };

  const removeRow = (idx) => {
    setPreviewData(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Импорт на лийдове от Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {!previewData && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Изберете файл</span>
                  <span className="text-slate-500"> или го плъзнете тук</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 mt-2">Поддържани формати: .xlsx, .xls, .csv</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-700 mb-2">Очаквани колони:</h4>
                <div className="flex flex-wrap gap-2">
                  {expectedColumns.map((col) => (
                    <span key={col} className="px-2 py-1 bg-white rounded border text-xs text-slate-600">{col}</span>
                  ))}
                </div>
              </div>

              {isUploading && (
                <div className="text-center py-4">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-500 mt-2">Обработка на файла...</p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Грешки:</span>
                  </div>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {errors.map((err, idx) => (<li key={idx}>{err}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {previewData && previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{previewData.length} записа готови за импорт</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreviewData(null)}>
                  Избери друг файл
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Име</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Препоръчител</TableHead>
                      <TableHead>Град</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 10).map((lead, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.referrer}</TableCell>
                        <TableCell>{lead.city}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            lead.leadType === 'recruiting' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {lead.leadType === 'recruiting' ? 'Рекрутинг' : 'Клиент'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => removeRow(idx)} className="h-8 w-8 p-0">
                            <X className="h-4 w-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.length > 10 && (
                  <div className="p-2 bg-slate-50 text-center text-sm text-slate-500">
                    ... и още {previewData.length - 10} записа
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>Отказ</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleImport}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Импортирай {previewData.length} лийда
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}