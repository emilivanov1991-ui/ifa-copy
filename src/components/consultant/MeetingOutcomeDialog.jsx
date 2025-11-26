import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  CalendarCheck, 
  CalendarX, 
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";

const meetingOutcomes = [
  { 
    id: 'lp_not_interested', 
    label: 'LP - Analysis Not Interested', 
    description: 'Клиентът не е заинтересован от анализ',
    icon: CalendarX, 
    color: 'text-red-500', 
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    newStatus: 'lp_not_interested'
  },
  { 
    id: 'lp_analysis_scheduled', 
    label: 'LP - Analysis Scheduled', 
    description: 'Насрочен е финансов анализ',
    icon: CalendarCheck, 
    color: 'text-green-500', 
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    newStatus: 'lp_analysis_scheduled',
    requiresDateTime: true
  },
];

export default function MeetingOutcomeDialog({ isOpen, onClose, client, meeting, onSave }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [notes, setNotes] = useState('');
  const [analysisDate, setAnalysisDate] = useState('');
  const [analysisTime, setAnalysisTime] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(null);
      setNotes('');
      setAnalysisDate('');
      setAnalysisTime('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedOutcome) {
      newErrors.outcome = 'Моля, изберете резултат от срещата';
    }

    const outcome = meetingOutcomes.find(o => o.id === selectedOutcome);
    if (outcome?.requiresDateTime) {
      if (!analysisDate) {
        newErrors.analysisDate = 'Датата е задължителна';
      }
      if (!analysisTime) {
        newErrors.analysisTime = 'Часът е задължителен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const outcome = meetingOutcomes.find(o => o.id === selectedOutcome);
    
    const meetingData = {
      outcome: selectedOutcome,
      outcomeLabel: outcome.label,
      notes,
      timestamp: new Date().toISOString(),
      clientId: client.id,
      meetingId: meeting?.id,
      newClientStatus: outcome.newStatus,
    };

    if (outcome.requiresDateTime) {
      meetingData.analysisAppointment = {
        date: analysisDate,
        time: analysisTime
      };
    }

    onSave(meetingData);
    onClose();
  };

  const selectedOutcomeData = meetingOutcomes.find(o => o.id === selectedOutcome);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Резултат от среща
          </DialogTitle>
          {client && (
            <p className="text-sm text-slate-500">
              Клиент: <span className="font-medium text-slate-700">{client.name}</span>
            </p>
          )}
          {meeting && (
            <p className="text-sm text-slate-500">
              Среща на: <span className="font-medium text-slate-700">{meeting.due} {meeting.time}</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Meeting Outcome Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Резултат от срещата *</Label>
            <div className="space-y-2">
              {meetingOutcomes.map((outcome) => {
                const Icon = outcome.icon;
                const isSelected = selectedOutcome === outcome.id;
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected 
                        ? `${outcome.bgColor} border-current ring-2 ring-offset-1` 
                        : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5", outcome.color)} />
                    <div>
                      <span className={cn("font-medium", isSelected ? outcome.color : "text-slate-700")}>
                        {outcome.label}
                      </span>
                      <p className="text-sm text-slate-500 mt-1">{outcome.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.outcome && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.outcome}
              </p>
            )}
          </div>

          {/* Analysis Appointment - Required for LP - Analysis Scheduled */}
          {selectedOutcomeData?.requiresDateTime && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <FileText className="h-5 w-5" />
                Насрочване на финансов анализ (задължително)
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Дата *</Label>
                  <Input 
                    type="date" 
                    value={analysisDate}
                    onChange={(e) => setAnalysisDate(e.target.value)}
                    className={cn(errors.analysisDate && "border-red-500")}
                  />
                  {errors.analysisDate && (
                    <p className="text-red-500 text-xs">{errors.analysisDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Час *</Label>
                  <Input 
                    type="time" 
                    value={analysisTime}
                    onChange={(e) => setAnalysisTime(e.target.value)}
                    className={cn(errors.analysisTime && "border-red-500")}
                  />
                  {errors.analysisTime && (
                    <p className="text-red-500 text-xs">{errors.analysisTime}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Бележки от срещата</Label>
            <Textarea 
              placeholder="Опишете срещата, важни детайли..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Отказ
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
            >
              Запази
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}