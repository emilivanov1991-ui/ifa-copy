import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PlanPDFExport({ planId, planData }) {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const response = await base44.functions.invoke('generatePlanPDF', { plan_id: planId });
      
      if (response.data.success) {
        // Convert base64 to blob and download
        const byteCharacters = atob(response.data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('PDF изтеглен успешно');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Грешка при експорт: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleExport}
      disabled={exporting}
      className="gap-2"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Генериране...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Изтегли PDF
        </>
      )}
    </Button>
  );
}