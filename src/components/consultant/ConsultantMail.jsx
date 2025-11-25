import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Mail, 
  Search, 
  Plus, 
  Star, 
  Trash2, 
  Archive,
  Send,
  Inbox,
  Clock,
  CheckCircle2,
  Paperclip,
  Reply,
  Forward
} from 'lucide-react';

const messages = [
  { 
    id: 1, 
    from: 'Иван Петров', 
    email: 'ivan@example.com',
    subject: 'Въпрос относно инвестиционен план', 
    preview: 'Здравейте, бих искал да попитам относно възможностите за...', 
    date: '10:30', 
    unread: true, 
    starred: true,
    category: 'client'
  },
  { 
    id: 2, 
    from: 'APEX Financial', 
    email: 'hr@apexfinancial.bg',
    subject: 'Ново обучение: Инвестиционни стратегии 2024', 
    preview: 'Уважаеми колеги, каним ви на ново обучение което ще се проведе...', 
    date: 'Вчера', 
    unread: true, 
    starred: false,
    category: 'internal'
  },
  { 
    id: 3, 
    from: 'Мария Иванова', 
    email: 'maria@example.com',
    subject: 'Re: Оферта за застраховка', 
    preview: 'Благодаря за изпратената информация. Бих искала да уточня...', 
    date: 'Вчера', 
    unread: false, 
    starred: false,
    category: 'client'
  },
  { 
    id: 4, 
    from: 'Система', 
    email: 'system@apexfinancial.bg',
    subject: 'Напомняне: Предстояща среща', 
    preview: 'Имате планирана среща с Георги Димитров утре в 11:00...', 
    date: '20 яну', 
    unread: false, 
    starred: false,
    category: 'system'
  },
  { 
    id: 5, 
    from: 'Елена Стоянова', 
    email: 'elena@example.com',
    subject: 'Документи за пенсионен фонд', 
    preview: 'Прилагам исканите документи за регистрация в пенсионния...', 
    date: '19 яну', 
    unread: false, 
    starred: true,
    category: 'client'
  },
];

const folders = [
  { id: 'inbox', label: 'Входящи', icon: Inbox, count: 2 },
  { id: 'sent', label: 'Изпратени', icon: Send, count: 0 },
  { id: 'starred', label: 'Със звезда', icon: Star, count: 2 },
  { id: 'archive', label: 'Архив', icon: Archive, count: 0 },
  { id: 'trash', label: 'Кошче', icon: Trash2, count: 0 },
];

export default function ConsultantMail() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const filteredMessages = messages.filter(m => {
    if (selectedFolder === 'starred') return m.starred;
    if (selectedFolder === 'inbox') return true;
    return true;
  }).filter(m => 
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Търси в съобщения..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ново съобщение
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ново съобщение</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>До</Label>
                <Input placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Относно</Label>
                <Input placeholder="Тема на съобщението" />
              </div>
              <div className="space-y-2">
                <Label>Съобщение</Label>
                <Textarea placeholder="Напишете вашето съобщение..." className="min-h-[200px]" />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Прикачи файл
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Отказ</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Изпрати
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Folders */}
        <Card className="lg:col-span-1">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {folders.map((folder) => {
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {folder.label}
                    </div>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            {selectedMessage ? (
              /* Message Detail */
              <div className="p-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mb-4"
                  onClick={() => setSelectedMessage(null)}
                >
                  ← Назад към списъка
                </Button>
                <div className="border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedMessage.subject}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        От: {selectedMessage.from} &lt;{selectedMessage.email}&gt;
                      </p>
                      <p className="text-sm text-slate-500">Дата: {selectedMessage.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Star className={`h-4 w-4 ${selectedMessage.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p>{selectedMessage.preview}</p>
                  <p className="mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                  <Button variant="outline">
                    <Reply className="h-4 w-4 mr-2" />
                    Отговори
                  </Button>
                  <Button variant="outline">
                    <Forward className="h-4 w-4 mr-2" />
                    Препрати
                  </Button>
                </div>
              </div>
            ) : (
              /* Messages List */
              <div className="divide-y divide-slate-100">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      message.unread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {message.from.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${message.unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                            {message.from}
                          </span>
                          <div className="flex items-center gap-2">
                            {message.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                            <span className="text-xs text-slate-500">{message.date}</span>
                          </div>
                        </div>
                        <p className={`text-sm ${message.unread ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                          {message.subject}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{message.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}