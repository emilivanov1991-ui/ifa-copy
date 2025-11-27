import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
  Eye,
  Brain,
  Shield,
  LogOut,
  Moon,
  Sun
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
import AIAnalyticsDashboard from '@/components/consultant/AIAnalyticsDashboard';
import RBACManager from '@/components/consultant/RBACManager';

const menuItems = [
  { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
  { id: 'crm', label: 'CRM / Клиенти', icon: Users },
  { id: 'analysis', label: 'Финансов анализ', icon: FileText },
  { id: 'ai-analytics', label: 'AI Аналитика', icon: Brain },
  { id: 'analytics', label: 'Статистики', icon: BarChart3 },
  { id: 'reports', label: 'Отчети', icon: DollarSign },
  { id: 'elearning', label: 'E-Learning', icon: GraduationCap },
  { id: 'calendar', label: 'Календар', icon: Calendar },
  { id: 'mail', label: 'Съобщения', icon: Mail },
  { id: 'integrations', label: 'Интеграции', icon: LayoutDashboard },
  { id: 'notifications', label: 'Известия', icon: Mail },
  { id: 'rbac', label: 'Достъп', icon: Shield, adminOnly: true },
];

export default function ConsultantPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('consultantPortalTheme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('consultantPortalTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex pt-0 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r fixed left-0 top-0 bottom-0 z-40 flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Logo */}
        <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>APEX</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Консултант</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>ИП</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>Иван Петров</p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Консултант</p>
            </div>
          </div>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className={`w-full ${darkMode ? 'border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-400' : 'text-slate-600 hover:text-red-600 hover:border-red-300'}`}>
              <LogOut className="h-4 w-4 mr-2" />
              Изход
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className={`border-b sticky top-0 z-30 px-6 h-14 flex items-center justify-between ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {menuItems.find(m => m.id === activeTab)?.label || 'Табло'}
          </h2>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDarkMode(!darkMode)}
              className={darkMode ? 'text-slate-300' : 'text-slate-600'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab('mail')}>
              <Mail className={`h-5 w-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setActiveTab('calendar')}>
              <Calendar className={`h-5 w-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <div className="space-y-6">
          {activeTab === 'dashboard' && <ConsultantDashboard onNavigate={setActiveTab} />}
          {activeTab === 'crm' && <ConsultantCRMAdvanced isAdmin={currentUser?.role === 'admin'} />}
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
          {activeTab === 'ai-analytics' && <AIAnalyticsDashboard />}
          {activeTab === 'analytics' && <ConsultantAnalytics />}
          {activeTab === 'reports' && <ConsultantReports />}
          {activeTab === 'elearning' && <ConsultantElearningAdvanced />}
          {activeTab === 'calendar' && <ConsultantCalendar />}
          {activeTab === 'mail' && <ConsultantMail />}
          {activeTab === 'integrations' && <ConsultantIntegrations />}
          {activeTab === 'notifications' && <ConsultantNotifications />}
          {activeTab === 'rbac' && <RBACManager />}
          </div>
        </div>
      </div>
    </div>
  );
}