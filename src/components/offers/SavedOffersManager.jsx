import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  FileText, 
  Calendar, 
  DollarSign, 
  Shield,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const PRODUCT_ICONS = {
  'MetLife Credit Guard': Shield,
  'MetLife Предимство': TrendingUp,
  'MetLife Детство': Shield,
  'MetLife Грижа': Shield,
  'MetLife Срочен живот': Shield,
  'MetLife Медика': Shield,
  'ДЗИ Закрила': Shield
};

const PRODUCT_COLORS = {
  'MetLife Credit Guard': 'blue',
  'MetLife Предимство': 'purple',
  'MetLife Детство': 'pink',
  'MetLife Грижа': 'teal',
  'MetLife Срочен живот': 'blue',
  'MetLife Медика': 'indigo',
  'ДЗИ Закрила': 'amber'
};

export default function SavedOffersManager({ analysisId, clientId }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch offers for this analysis
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers', analysisId],
    queryFn: async () => {
      const allOffers = await base44.entities.ProductOffer.filter({ analysis_id: analysisId });
      return allOffers.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!analysisId
  });

  // Delete offer mutation
  const deleteMutation = useMutation({
    mutationFn: (offerId) => base44.entities.ProductOffer.delete(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['offers', analysisId]);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ offerId, status }) => 
      base44.entities.ProductOffer.update(offerId, { offer_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['offers', analysisId]);
    }
  });

  const filteredOffers = filterStatus === 'all' 
    ? offers 
    : offers.filter(o => o.offer_status === filterStatus);

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Зареждане...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Запазени оферти</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички</SelectItem>
            <SelectItem value="draft">Чернова</SelectItem>
            <SelectItem value="generated">Генерирани</SelectItem>
            <SelectItem value="sent">Изпратени</SelectItem>
            <SelectItem value="accepted">Приети</SelectItem>
            <SelectItem value="rejected">Отхвърлени</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Няма запазени оферти</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOffers.map((offer) => {
            const Icon = PRODUCT_ICONS[offer.product_name] || Shield;
            const color = PRODUCT_COLORS[offer.product_name] || 'slate';
            
            return (
              <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className={`bg-${color}-50 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 text-${color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{offer.product_name}</CardTitle>
                        <p className="text-sm text-slate-600">{offer.provider}</p>
                      </div>
                    </div>
                    <Badge variant={
                      offer.offer_status === 'accepted' ? 'default' :
                      offer.offer_status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {offer.offer_status === 'draft' && 'Чернова'}
                      {offer.offer_status === 'generated' && 'Генерирана'}
                      {offer.offer_status === 'sent' && 'Изпратена'}
                      {offer.offer_status === 'accepted' && 'Приета'}
                      {offer.offer_status === 'rejected' && 'Отхвърлена'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Financial Details */}
                    <div className="space-y-2">
                      {offer.monthly_premium && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">Месечна премия:</span>
                          <span className="font-semibold">{offer.monthly_premium.toFixed(2)} €</span>
                        </div>
                      )}
                      {offer.annual_premium && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">Годишна премия:</span>
                          <span className="font-semibold">{offer.annual_premium.toFixed(2)} €</span>
                        </div>
                      )}
                      {offer.coverage_amount && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">Покритие:</span>
                          <span className="font-semibold">{offer.coverage_amount.toLocaleString()} €</span>
                        </div>
                      )}
                      {offer.term_years && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">Срок:</span>
                          <span className="font-semibold">{offer.term_years} години</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      {offer.beneficiary_name && (
                        <div className="text-sm">
                          <span className="text-slate-600">Бенефициент:</span>
                          <span className="font-medium ml-2">{offer.beneficiary_name}</span>
                        </div>
                      )}
                      {offer.strategy && (
                        <div className="text-sm">
                          <span className="text-slate-600">Стратегия:</span>
                          <span className="font-medium ml-2">{offer.strategy}</span>
                        </div>
                      )}
                      {offer.risk_class && (
                        <div className="text-sm">
                          <span className="text-slate-600">Рисков клас:</span>
                          <span className="font-medium ml-2">{offer.risk_class === 1 ? 'I' : offer.risk_class === 2 ? 'II' : 'III'}</span>
                        </div>
                      )}
                      <div className="text-sm text-slate-500">
                        {format(new Date(offer.created_date), 'dd.MM.yyyy HH:mm')}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {offer.ai_recommendation_reason && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">{offer.ai_recommendation_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Select 
                      value={offer.offer_status} 
                      onValueChange={(status) => updateStatusMutation.mutate({ offerId: offer.id, status })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Чернова</SelectItem>
                        <SelectItem value="generated">Генерирана</SelectItem>
                        <SelectItem value="sent">Изпратена</SelectItem>
                        <SelectItem value="accepted">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Приета
                          </div>
                        </SelectItem>
                        <SelectItem value="rejected">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Отхвърлена
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteMutation.mutate(offer.id)}
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
    </div>
  );
}