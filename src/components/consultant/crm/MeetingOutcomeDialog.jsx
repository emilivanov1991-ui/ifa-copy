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
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarX
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { getOutcomesForMeeting, MEETING_TYPE_LABELS } from './CRMConstants';

const outcomeIcons = {
  'lp_not_interested': XCircle,
  'lp_analysis_scheduled': Calendar,
  'lp_not_show_up': CalendarX,
  'analysis_done': CheckCircle,
  'analysis_fpp_scheduled': Calendar,
  'analysis_fpp_not_interested': XCircle,
  'analysis_fpp_presented': CheckCircle,
  'fpp_to_be_signed': CheckCircle,
  'fpp_rejected': XCircle,
};

const outcomeColors = {
  'lp_not_interested': 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200',
  'lp_analysis_scheduled': 'text-green-500 bg-green-50 hover:bg-green-100 border-green-200',
  'lp_not_show_up': 'text-orange-500 bg-orange-50 hover:bg-orange-100 border-orange-200',
  'analysis_done': 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
  'analysis_fpp_scheduled': 'text-blue-500 bg-blue-50 hover:bg-blue-100 border-blue-200',
  'analysis_fpp_not_interested': 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200',
  'analysis_fpp_presented': 'text-purple-500 bg-purple-50 hover:bg-purple-100 border-purple-200',
  'fpp_to_be_signed': 'text-green-500 bg-green-50 hover:bg-green-100 border-green-200',
  'fpp_rejected': 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200',
};

export default function MeetingOutcomeDialog({ isOpen, onClose, client, meeting, onSave }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');
  const [errors, setErrors] = useState({});

  const outcomes = client ? getOutcomesForMeeting(client.type, client.status) : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(null);
      setNotes('');
      setNextDate('');
      setNextTime('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedOutcome) {
      newErrors.outcome = 'Моля, изберете резултат';
      setErrors(newErrors);
      return false;
    }

    const outcome = outcomes.find(o => o.id === selectedOutcome);
    if (outcome?.requiresDateTime) {
      if (!nextDate) newErrors.nextDate = 'Датата е задължителна';
      if (!nextTime) newErrors.nextTime = 'Часът е задължителен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const outcome = outcomes.find(o => o.id === selectedOutcome);
    
    const meetingData = {
      outcome: selectedOutcome,
      outcomeLabel: outcome.label,
      notes,
      timestamp: new Date().toISOString(),
      clientId: client.id,
      meetingId: meeting?.id,
      newStatus: outcome.newStatus,
      newType: outcome.newType,
      convertsTo: outcome.convertsTo,
    };

    if (outcome.requiresDateTime) {
      meetingData.nextAppointment = {
        date: nextDate,
        time: nextTime
      };
    }

    onSave(meetingData);
    onClose();
  };

  const getMeetingTypeLabel = () => {
    if (!client) return 'Среща';
    if (client.type === 'lead') {
      if (client.status === 'picked_up_arranged') return MEETING_TYPE_LABELS.lp_meeting;
      if (client.status === 'lp_analysis_scheduled') return MEETING_TYPE_LABELS.analysis_meeting;
    }
    if (client.type === 'opportunity') {
      if (client.status === 'analysis_done') return MEETING_TYPE_LABELS.fpp_meeting;
      if (client.status === 'analysis_fpp_scheduled') return MEETING_TYPE_LABELS.fpp_presentation;
      if (client.status === 'analysis_fpp_presented') return MEETING_TYPE_LABELS.signing_meeting;
    }
    return 'Среща';
  };

  const selectedOutcomeData = outcomes.find(o => o.id === selectedOutcome);

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Резултат от {getMeetingTypeLabel()}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Клиент: <span className="font-medium text-slate-700">{client.name}</span>
          </p>
          {meeting && (
            <p className="text-sm text-slate-500">
              Дата: <span className="font-medium text-slate-700">{meeting.due} {meeting.time}</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Outcome Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Резултат *</Label>
            <div className="space-y-2">
              {outcomes.map((outcome) => {
                const Icon = outcomeIcons[outcome.id] || Calendar;
                const isSelected = selectedOutcome === outcome.id;
                const colorClass = outcomeColors[outcome.id] || 'bg-slate-50';
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected ? `${colorClass} border-current ring-2 ring-offset-1` : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mt-0.5", isSelected ? '' : 'text-slate-400')} />
                    <div>
                      <span className="font-medium">{outcome.label}</span>
                      <p className="text-sm text-slate-500 mt-1">{outcome.description}</p>
                      {outcome.convertsTo && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          → Преминава в {outcome.convertsTo === 'opportunity' ? 'Opportunity' : 'Customer'}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.outcome && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />{errors.outcome}
              </p>
            )}
          </div>

          {/* Next Appointment - if required */}
          {selectedOutcomeData?.requiresDateTime && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <Clock className="h-5 w-5" />
                Следваща среща (задължително)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Дата *</Label>
                  <Input 
                    type="date" 
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className={cn(errors.nextDate && "border-red-500")}
                  />
                  {errors.nextDate && <p className="text-red-500 text-xs">{errors.nextDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Час *</Label>
                  <Input 
                    type="time" 
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    className={cn(errors.nextTime && "border-red-500")}
                  />
                  {errors.nextTime && <p className="text-red-500 text-xs">{errors.nextTime}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Бележки</Label>
            <Textarea 
              placeholder="Допълнителни бележки..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Отказ</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>Запази</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}