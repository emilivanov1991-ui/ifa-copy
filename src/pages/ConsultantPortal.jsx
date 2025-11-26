import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  Mail,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ConsultantDashboard from '@/components/consultant/ConsultantDashboard';
import ConsultantCRMAdvanced from '@/components/consultant/ConsultantCRMAdvanced';
import ConsultantStatistics from '@/components/consultant/ConsultantStatistics';
import ConsultantReports from '@/components/consultant/ConsultantReports';
import ConsultantElearningAdvanced from '@/components/consultant/ConsultantElearningAdvanced';
import ConsultantCalendar from '@/components/consultant/ConsultantCalendar';
import ConsultantMail from '@/components/consultant/ConsultantMail';
import ConsultantAnalytics from '@/components/consultant/ConsultantAnalytics';
import ConsultantIntegrations from '@/components/consultant/ConsultantIntegrations';
import ConsultantNotifications from '@/components/consultant/ConsultantNotifications';

const menuItems = [
  { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM / Клиенти', icon: Users },
  { id: 'analysis', label: 'Финансов анализ', icon: FileText },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { id: 'reports', label: 'Отчети', icon: DollarSign },
  { id: 'elearning', label: 'E-Learning', icon: GraduationCap },
  { id: 'calendar', label: 'Календар', icon: Calendar },
  { id: 'mail', label: 'Съобщения', icon: Mail },
  { id: 'integrations', label: 'Интеграции', icon: LayoutDashboard },
  { id: 'notifications', label: 'Известия', icon: Mail },
];

export default function ConsultantPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">APEX Consultant</h1>
                <p className="text-xs text-slate-500">Консултантски портал</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Mail className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Calendar className="h-5 w-5 text-slate-600" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">ИП</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && <ConsultantDashboard onNavigate={setActiveTab} />}
          {activeTab === 'crm' && <ConsultantCRMAdvanced />}
          {activeTab === 'analysis' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Финансов анализ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Създайте нов финансов анализ или прегледайте съществуващите.</p>
                <div className="flex gap-3">
                  <Link to={createPageUrl('FinancialAnalysis')}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Нов анализ
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Преглед на анализи
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === 'analytics' && <ConsultantAnalytics />}
          {activeTab === 'reports' && <ConsultantReports />}
          {activeTab === 'elearning' && <ConsultantElearningAdvanced />}
          {activeTab === 'calendar' && <ConsultantCalendar />}
          {activeTab === 'mail' && <ConsultantMail />}
          {activeTab === 'integrations' && <ConsultantIntegrations />}
          {activeTab === 'notifications' && <ConsultantNotifications />}
        </div>
      </div>
    </div>
  );
}