import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Brain, 
  Sparkles, 
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Send,
  Copy,
  RefreshCw,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICRMAssistant({ client, communications, onCreateTask, onSendEmail }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  const generateSuggestions = async () => {
    if (!client) return;
    
    setIsGenerating(true);
    try {
      const lastComm = communications?.[0];
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ти си AI асистент на финансов консултант. Анализирай следния клиент и предложи следващи стъпки:

Клиент: ${client.name}
Email: ${client.email}
Статус: ${client.status}
Брой продукти: ${client.products}
Стойност на портфолио: ${client.value}€
Lead Score: ${client.score}
Последен контакт: ${client.lastContact}
${lastComm ? `Последна комуникация: ${lastComm.type} - ${lastComm.notes}` : ''}

Брой чакащи задачи: ${client.tasks?.filter(t => t.status === 'pending').length || 0}

Генерирай:
1. Три конкретни следващи стъпки/задачи за този клиент
2. Препоръка за най-добър канал за комуникация
3. Потенциални продукти за предлагане
4. Риск от загуба на клиента (нисък/среден/висок)

Отговори на български.`,
        response_json_schema: {
          type: "object",
          properties: {
            nextSteps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            },
            bestChannel: { type: "string" },
            productSuggestions: {
              type: "array",
              items: { type: "string" }
            },
            churnRisk: { type: "string" },
            churnReason: { type: "string" }
          }
        }
      });
      setSuggestions(result);
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('Грешка при генериране на препоръки');
    }
    setIsGenerating(false);
  };

  const generateEmail = async (type) => {
    if (!client) return;
    
    setIsGenerating(true);
    try {
      const lastComm = communications?.[0];
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Напиши професионален имейл на български език за финансов консултант.

Тип имейл: ${type === 'followup' ? 'Последващ имейл след обаждане' : 
             type === 'meeting' ? 'Потвърждение на среща' :
             type === 'offer' ? 'Изпращане на оферта' : 'Общ имейл'}

Клиент: ${client.name}
${lastComm ? `Последна комуникация: ${lastComm.type} на ${lastComm.date} - ${lastComm.notes}` : ''}

Имейлът трябва да бъде:
- Персонализиран с името на клиента
- Професионален, но приятелски тон
- Кратък и ясен
- С ясен призив за действие

Генерирай subject и body на имейла.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });
      setEmailDraft(result);
      setEmailContent(result.body);
      setIsEmailDialogOpen(true);
    } catch (error) {
      console.error('Email generation error:', error);
      toast.error('Грешка при генериране на имейл');
    }
    setIsGenerating(false);
  };

  const handleSendEmail = async () => {
    if (!client?.email || !emailDraft) return;
    
    try {
      await base44.integrations.Core.SendEmail({
        to: client.email,
        subject: emailDraft.subject,
        body: emailContent
      });
      toast.success('Имейлът е изпратен успешно');
      setIsEmailDialogOpen(false);
      setEmailDraft(null);
    } catch (error) {
      toast.error('Грешка при изпращане на имейл');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Копирано в клипборда');
  };

  const createTaskFromSuggestion = (step) => {
    if (onCreateTask) {
      onCreateTask({
        title: step.action,
        priority: step.priority,
        deadline: step.deadline
      });
      toast.success('Задачата е създадена');
    }
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p?.includes('висок') || p === 'high') return 'bg-red-100 text-red-700';
    if (p?.includes('сред') || p === 'medium') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getRiskColor = (risk) => {
    const r = risk?.toLowerCase();
    if (r?.includes('висок') || r === 'high') return 'text-red-600';
    if (r?.includes('сред') || r === 'medium') return 'text-amber-600';
    return 'text-green-600';
  };

  if (!client) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Изберете клиент за AI асистент</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Assistant Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-purple-700">
            <Brain className="h-5 w-5" />
            AI Асистент за {client.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Генерирай препоръки
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateEmail('followup')}
              disabled={isGenerating}
            >
              <Mail className="h-4 w-4 mr-2" />
              Имейл след обаждане
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateEmail('meeting')}
              disabled={isGenerating}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Потвърждение среща
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateEmail('offer')}
              disabled={isGenerating}
            >
              <Target className="h-4 w-4 mr-2" />
              Оферта
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              AI Препоръки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Next Steps */}
            <div>
              <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Следващи стъпки
              </h4>
              <div className="space-y-2">
                {suggestions.nextSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{step.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(step.priority)} variant="outline">
                            {step.priority}
                          </Badge>
                          <span className="text-xs text-slate-500">{step.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => createTaskFromSuggestion(step)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Channel */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Препоръчан канал
              </h4>
              <p className="text-sm text-blue-700">{suggestions.bestChannel}</p>
            </div>

            {/* Product Suggestions */}
            <div>
              <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Потенциални продукти
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.productSuggestions?.map((product, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Churn Risk */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Риск от загуба
              </h4>
              <p className={`text-sm font-medium ${getRiskColor(suggestions.churnRisk)}`}>
                {suggestions.churnRisk}
              </p>
              {suggestions.churnReason && (
                <p className="text-xs text-slate-500 mt-1">{suggestions.churnReason}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Генериран имейл
            </DialogTitle>
          </DialogHeader>
          {emailDraft && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">До:</Label>
                <p className="text-sm text-slate-600">{client.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Тема:</Label>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(emailDraft.subject)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm p-2 bg-slate-50 rounded">{emailDraft.subject}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Съдържание:</Label>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => copyToClipboard(emailContent)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea 
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Отказ
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Изпрати
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}