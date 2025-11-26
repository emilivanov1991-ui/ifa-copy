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
  PhoneOff, 
  Voicemail, 
  PhoneMissed, 
  PhoneCall, 
  CalendarCheck,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

const callOutcomes = [
  { id: 'not_picked_up', label: 'Not Picked Up', icon: PhoneMissed, color: 'text-red-500', bgColor: 'bg-red-50 hover:bg-red-100 border-red-200' },
  { id: 'voice_mail', label: 'Voice Mail', icon: Voicemail, color: 'text-amber-500', bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  { id: 'hung_up', label: 'Hung Up', icon: PhoneOff, color: 'text-orange-500', bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
  { id: 'picked_up_not_arranged', label: 'Picked Up - Not Arranged', icon: PhoneCall, color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
  { id: 'picked_up_arranged', label: 'Picked Up - Arranged', icon: CalendarCheck, color: 'text-green-500', bgColor: 'bg-green-50 hover:bg-green-100 border-green-200' },
];

const getClientStatusFromOutcome = (outcomeId) => {
  switch (outcomeId) {
    case 'not_picked_up':
      return 'no_answer';
    case 'voice_mail':
      return 'voicemail_left';
    case 'hung_up':
      return 'callback_needed';
    case 'picked_up_not_arranged':
      return 'contacted';
    case 'picked_up_arranged':
      return 'meeting_scheduled';
    default:
      return 'unknown';
  }
};

const statusLabels = {
  no_answer: 'Не отговаря',
  voicemail_left: 'Оставено съобщение',
  callback_needed: 'Нужно повторно обаждане',
  contacted: 'Контактуван',
  meeting_scheduled: 'Насрочена среща'
};

export default function CallOutcomeDialog({ isOpen, onClose, client, onSave }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpAction, setFollowUpAction] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(null);
      setNotes('');
      setFollowUpDate('');
      setFollowUpTime('');
      setFollowUpAction('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingLocation('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedOutcome) {
      newErrors.outcome = 'Моля, изберете резултат от разговора';
    }

    if (selectedOutcome === 'picked_up_arranged') {
      if (!meetingDate) {
        newErrors.meetingDate = 'Датата на срещата е задължителна';
      }
      if (!meetingTime) {
        newErrors.meetingTime = 'Часът на срещата е задължителен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newStatus = getClientStatusFromOutcome(selectedOutcome);
    
    const callData = {
      outcome: selectedOutcome,
      outcomeLabel: callOutcomes.find(o => o.id === selectedOutcome)?.label,
      notes,
      timestamp: new Date().toISOString(),
      clientId: client.id,
      newClientStatus: newStatus,
      newClientStatusLabel: statusLabels[newStatus],
    };

    if (followUpDate) {
      callData.followUp = {
        date: followUpDate,
        time: followUpTime,
        action: followUpAction || 'Последващо обаждане'
      };
    }

    if (selectedOutcome === 'picked_up_arranged') {
      callData.meeting = {
        date: meetingDate,
        time: meetingTime,
        location: meetingLocation
      };
    }

    onSave(callData);
    onClose();
  };

  const isArranged = selectedOutcome === 'picked_up_arranged';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-blue-600" />
            Резултат от обаждане
          </DialogTitle>
          {client && (
            <p className="text-sm text-slate-500">
              Клиент: <span className="font-medium text-slate-700">{client.name}</span> • {client.phone}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Call Outcome Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Статус на разговора *</Label>
            <div className="grid grid-cols-1 gap-2">
              {callOutcomes.map((outcome) => {
                const Icon = outcome.icon;
                const isSelected = selectedOutcome === outcome.id;
                return (
                  <button
                    key={outcome.id}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                      isSelected 
                        ? `${outcome.bgColor} border-current ring-2 ring-offset-1` 
                        : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", outcome.color)} />
                    <span className={cn("font-medium", isSelected ? outcome.color : "text-slate-700")}>
                      {outcome.label}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-xs text-slate-500">
                        → {statusLabels[getClientStatusFromOutcome(outcome.id)]}
                      </span>
                    )}
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

          {/* Meeting Details - Required for "Picked Up - Arranged" */}
          {isArranged && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CalendarCheck className="h-5 w-5" />
                Детайли за срещата (задължително)
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Дата на среща *</Label>
                  <Input 
                    type="date" 
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className={cn(errors.meetingDate && "border-red-500")}
                  />
                  {errors.meetingDate && (
                    <p className="text-red-500 text-xs">{errors.meetingDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Час на среща *</Label>
                  <Input 
                    type="time" 
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className={cn(errors.meetingTime && "border-red-500")}
                  />
                  {errors.meetingTime && (
                    <p className="text-red-500 text-xs">{errors.meetingTime}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Място / Локация</Label>
                <Input 
                  placeholder="Офис, онлайн, адрес..."
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Бележки от разговора</Label>
            <Textarea 
              placeholder="Опишете разговора, важни детайли, интереси на клиента..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Follow-up Task */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Calendar className="h-5 w-5" />
              Следваща задача (по избор)
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Дата</Label>
                <Input 
                  type="date" 
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Час</Label>
                <Input 
                  type="time" 
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Действие</Label>
              <Input 
                placeholder="Напр. Последващо обаждане, Изпращане на оферта..."
                value={followUpAction}
                onChange={(e) => setFollowUpAction(e.target.value)}
              />
            </div>
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