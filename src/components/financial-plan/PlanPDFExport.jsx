import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanPDFExport({ planId, planData }) {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // TODO: Implement PDF generation via backend function
      toast.info('PDF експорт скоро ще бъде наличен');
      
      // Placeholder for future implementation
      // const response = await base44.functions.invoke('generatePlanPDF', { plan_id: planId });
      // Download the PDF...
      
    } catch (error) {
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