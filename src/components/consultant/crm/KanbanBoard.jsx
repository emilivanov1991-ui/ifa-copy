import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from 'lucide-react';
import { CLIENT_TYPES, getStatusInfo } from './CRMConstants';

const KANBAN_STAGES = [
  {
    id: 'scheduled',
    title: 'Scheduled',
    statuses: ['picked_up_arranged'],
    color: 'bg-blue-500'
  },
  {
    id: 'life_planner',
    title: 'Life Planner',
    statuses: ['lp_analysis_not_interested', 'lp_analysis_scheduled', 'lp_not_show_up'],
    color: 'bg-purple-500'
  },
  {
    id: 'analysis',
    title: 'Analysis',
    statuses: ['analysis_done', 'analysis_fpp_not_interested', 'analysis_fpp_scheduled'],
    color: 'bg-amber-500'
  },
  {
    id: 'financial_plan',
    title: 'Financial Plan',
    statuses: ['analysis_fpp_presented', 'fpp_rejected', 'fpp_to_be_signed'],
    color: 'bg-orange-500'
  },
  {
    id: 'signed_paid',
    title: 'Signed & Paid',
    statuses: ['signed_and_paid'],
    color: 'bg-green-500'
  }
];

export default function KanbanBoard({ clients, onSelectClient, onCall, selectedClient }) {
  const getClientsForStage = (stage) => {
    return clients.filter(client => stage.statuses.includes(client.status));
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_STAGES.map(stage => {
        const stageClients = getClientsForStage(stage);
        return (
          <div key={stage.id} className="flex-shrink-0 w-72">
            <div className={`${stage.color} text-white px-3 py-2 rounded-t-lg flex items-center justify-between`}>
              <span className="font-medium">{stage.title}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {stageClients.length}
              </Badge>
            </div>
            <div className="bg-slate-100 rounded-b-lg p-2 min-h-[400px] space-y-2">
              {stageClients.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Няма клиенти</p>
              ) : (
                stageClients.map(client => (
                  <Card 
                    key={client.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedClient?.id === client.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => onSelectClient(client)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            client.type === 'lead' ? 'bg-amber-100 text-amber-600' : 
                            client.type === 'opportunity' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {client.name?.split(' ').map(n => n?.[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{client.name}</p>
                            <p className="text-xs text-slate-500">{client.city}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={`${getStatusInfo(client.type, client.status).color} text-xs`}>
                        {getStatusInfo(client.type, client.status).label}
                      </Badge>

                      {client.lastContact && (
                        <p className="text-xs text-slate-400 mt-2">
                          Последен контакт: {client.lastContact}
                        </p>
                      )}

                      <div className="flex gap-1 mt-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCall(client);
                          }}
                        >
                          <Phone className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        {client.email && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${client.email}`;
                            }}
                          >
                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}