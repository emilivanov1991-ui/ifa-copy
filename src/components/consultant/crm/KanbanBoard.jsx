import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Phone, Mail, Lock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { CLIENT_TYPES, getStatusInfo, LEAD_STATUSES, OPPORTUNITY_STATUSES, CUSTOMER_STATUSES } from './CRMConstants';

const KANBAN_STAGES = [
  {
    id: 'scheduled',
    title: 'Scheduled',
    statuses: ['picked_up_arranged'],
    color: 'bg-blue-500',
    allowedStatuses: ['picked_up_arranged']
  },
  {
    id: 'life_planner',
    title: 'Life Planner',
    statuses: ['lp_not_interested', 'lp_analysis_scheduled', 'lp_not_show_up'],
    color: 'bg-purple-500',
    allowedStatuses: ['lp_not_interested', 'lp_analysis_scheduled', 'lp_not_show_up']
  },
  {
    id: 'analysis',
    title: 'Analysis',
    statuses: ['analysis_done', 'analysis_fpp_not_interested', 'analysis_fpp_scheduled'],
    color: 'bg-amber-500',
    allowedStatuses: ['analysis_done', 'analysis_fpp_not_interested', 'analysis_fpp_scheduled']
  },
  {
    id: 'financial_plan',
    title: 'Financial Plan',
    statuses: ['analysis_fpp_presented', 'fpp_rejected', 'fpp_to_be_signed'],
    color: 'bg-orange-500',
    allowedStatuses: ['analysis_fpp_presented', 'fpp_rejected', 'fpp_to_be_signed']
  },
  {
    id: 'signed_paid',
    title: 'Signed & Paid',
    statuses: ['signed_and_paid'],
    color: 'bg-green-500',
    allowedStatuses: ['signed_and_paid'],
    adminOnly: true
  }
];

// Get all statuses with labels for a stage
const getStatusOptionsForStage = (stageId) => {
  const stage = KANBAN_STAGES.find(s => s.id === stageId);
  if (!stage) return [];
  
  const allStatuses = { ...LEAD_STATUSES, ...OPPORTUNITY_STATUSES, ...CUSTOMER_STATUSES };
  return stage.allowedStatuses.map(status => ({
    value: status,
    label: allStatuses[status]?.label || status
  }));
};

export default function KanbanBoard({ clients, onSelectClient, onCall, selectedClient, onStatusChange }) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');

  const getClientsForStage = (stage) => {
    return clients.filter(client => stage.statuses.includes(client.status));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceStageId = result.source.droppableId;
    const destStageId = result.destination.droppableId;
    
    if (sourceStageId === destStageId) return;
    
    const destStage = KANBAN_STAGES.find(s => s.id === destStageId);
    
    // Block moving to signed_paid (admin only)
    if (destStage?.adminOnly) {
      toast.error('Само администратор може да премести клиенти в "Signed & Paid"');
      return;
    }
    
    const clientId = parseInt(result.draggableId);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) return;
    
    // Open status selection dialog
    setPendingMove({
      client,
      sourceStageId,
      destStageId,
      destStage
    });
    setSelectedNewStatus(destStage.allowedStatuses[0]);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!pendingMove || !selectedNewStatus) return;
    
    // Determine new type based on status
    let newType = pendingMove.client.type;
    if (OPPORTUNITY_STATUSES[selectedNewStatus]) {
      newType = 'opportunity';
    } else if (CUSTOMER_STATUSES[selectedNewStatus]) {
      newType = 'customer';
    } else if (LEAD_STATUSES[selectedNewStatus]) {
      newType = 'lead';
    }
    
    if (onStatusChange) {
      onStatusChange(pendingMove.client, selectedNewStatus, newType);
    }
    
    toast.success(`Статусът е променен на "${getStatusOptionsForStage(pendingMove.destStageId).find(s => s.value === selectedNewStatus)?.label}"`);
    setStatusDialogOpen(false);
    setPendingMove(null);
    setSelectedNewStatus('');
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 w-full">
          {KANBAN_STAGES.map(stage => {
            const stageClients = getClientsForStage(stage);
            return (
              <div key={stage.id} className="flex-1 min-w-0">
                <div className={`${stage.color} text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{stage.title}</span>
                    {stage.adminOnly && <Lock className="h-3 w-3" />}
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {stageClients.length}
                  </Badge>
                </div>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-slate-100 rounded-b-lg p-2 space-y-2 overflow-y-auto ${
                        snapshot.isDraggingOver ? 'bg-slate-200' : ''
                      } ${stage.adminOnly && snapshot.isDraggingOver ? 'bg-red-100' : ''}`}
                      style={{ height: 'calc(100vh - 320px)', minHeight: '300px' }}
                    >
                      {stageClients.length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-4">Няма клиенти</p>
                      ) : (
                        stageClients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Card 
                                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                                    selectedClient?.id === client.id ? 'ring-2 ring-blue-500' : ''
                                  } ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                  onClick={() => onSelectClient(client)}
                                >
                                  <CardContent className="p-2">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                                        client.type === 'lead' ? 'bg-amber-100 text-amber-600' : 
                                        client.type === 'opportunity' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                      }`}>
                                        {client.name?.split(' ').map(n => n?.[0]).join('')}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-xs text-slate-900 truncate">{client.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{client.city}</p>
                                      </div>
                                    </div>
                                    
                                    <Badge className={`${getStatusInfo(client.type, client.status).color} text-[10px] px-1.5 py-0`}>
                                      {getStatusInfo(client.type, client.status).label}
                                    </Badge>

                                    <div className="flex gap-1 mt-1.5">
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onCall(client);
                                        }}
                                      >
                                        <Phone className="h-3 w-3 text-green-600" />
                                      </Button>
                                      {client.email && (
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:${client.email}`;
                                          }}
                                        >
                                          <Mail className="h-3 w-3 text-blue-600" />
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Промяна на статус</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {pendingMove && (
              <>
                <p className="text-sm text-slate-600">
                  Преместване на <span className="font-medium">{pendingMove.client.name}</span> към <span className="font-medium">{pendingMove.destStage.title}</span>
                </p>
                <div className="space-y-2">
                  <Label>Изберете нов статус</Label>
                  <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getStatusOptionsForStage(pendingMove.destStageId).map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Отказ</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmStatusChange}>Потвърди</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}