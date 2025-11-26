import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Calendar, MapPin, Users, CalendarCheck, Clock } from 'lucide-react';
import { CLIENT_TYPES, LEAD_TYPES, getStatusInfo, MEETING_TYPE_LABELS } from './CRMConstants';

export default function ClientCard({ 
  client, 
  isSelected, 
  onSelect, 
  onCall, 
  onMeetingOutcome 
}) {
  const statusInfo = getStatusInfo(client.type, client.status);
  const hasPendingMeeting = client.tasks?.some(t => t.type === 'meeting' && t.status === 'pending');
  const pendingMeeting = client.tasks?.find(t => t.type === 'meeting' && t.status === 'pending');
  
  // Check if meeting is due (today or past)
  const isMeetingDue = pendingMeeting && new Date(pendingMeeting.due) <= new Date();

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isMeetingDue ? 'border-amber-300 bg-amber-50/50' : ''}`}
      onClick={() => onSelect(client)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              client.type === 'lead' ? 'bg-amber-100' : 
              client.type === 'opportunity' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <span className={`text-sm font-medium ${
                client.type === 'lead' ? 'text-amber-600' : 
                client.type === 'opportunity' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {client.name?.split(' ').map(n => n?.[0] || '').join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-slate-900">{client.name}</p>
              {client.city && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" /> {client.city}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={CLIENT_TYPES[client.type]?.color}>
              {CLIENT_TYPES[client.type]?.label}
            </Badge>
            {client.leadType && LEAD_TYPES[client.leadType] && (
              <Badge variant="outline" className={LEAD_TYPES[client.leadType]?.color}>
                {LEAD_TYPES[client.leadType]?.label}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Status */}
        {client.status && client.status !== 'new' && (
          <div className="mt-2">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
        )}

        {/* Referrer */}
        {client.referrer && (
          <p className="text-xs text-slate-500 mt-2">
            <Users className="h-3 w-3 inline mr-1" />
            Препоръчител: {client.referrer}
          </p>
        )}

        {/* Scheduled Meeting indicator */}
        {pendingMeeting && (
          <div className={`mt-2 p-2 rounded text-xs ${isMeetingDue ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            {isMeetingDue ? (
              <Clock className="h-3 w-3 inline mr-1" />
            ) : (
              <Calendar className="h-3 w-3 inline mr-1" />
            )}
            {pendingMeeting.title}: {pendingMeeting.due} {pendingMeeting.time}
          </div>
        )}

        {/* Stats for customers */}
        {client.type === 'customer' && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className="text-xs">{client.products || 0} продукта</Badge>
            <Badge variant="outline" className="text-xs">{(client.value || 0).toLocaleString()} €</Badge>
          </div>
        )}

        {/* Tasks indicator */}
        {client.tasks?.filter(t => t.status === 'pending').length > 0 && (
          <div className="mt-2">
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              {client.tasks.filter(t => t.status === 'pending').length} чакащи задачи
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={(e) => { e.stopPropagation(); onCall(client); }}
          >
            <PhoneCall className="h-4 w-4 mr-1" />
            Обади се
          </Button>
          {isMeetingDue && (
            <Button 
              size="sm" 
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={(e) => { e.stopPropagation(); onMeetingOutcome(client, pendingMeeting); }}
            >
              <CalendarCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}