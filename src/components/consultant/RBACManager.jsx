import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  Users, 
  Lock, 
  Unlock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  FileText,
  Clock,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Role definitions
const roles = {
  admin: {
    name: 'Администратор',
    color: 'bg-purple-100 text-purple-700',
    permissions: ['all']
  },
  manager: {
    name: 'Мениджър',
    color: 'bg-blue-100 text-blue-700',
    permissions: ['crm.read', 'crm.write', 'analytics.read', 'analytics.write', 'reports.read', 'reports.write', 'team.read']
  },
  consultant: {
    name: 'Консултант',
    color: 'bg-green-100 text-green-700',
    permissions: ['crm.read', 'crm.write.own', 'analytics.read.own', 'reports.read.own']
  },
  viewer: {
    name: 'Наблюдател',
    color: 'bg-slate-100 text-slate-700',
    permissions: ['crm.read', 'analytics.read', 'reports.read']
  }
};

// Module permissions
const modules = [
  { id: 'crm', name: 'CRM', icon: Users, actions: ['read', 'write', 'delete'] },
  { id: 'analytics', name: 'Анализи', icon: FileText, actions: ['read', 'write'] },
  { id: 'reports', name: 'Отчети', icon: FileText, actions: ['read', 'write', 'export'] },
  { id: 'elearning', name: 'Обучения', icon: FileText, actions: ['read', 'write'] },
  { id: 'settings', name: 'Настройки', icon: Settings, actions: ['read', 'write'] },
  { id: 'team', name: 'Екип', icon: Users, actions: ['read', 'write', 'invite'] },
];

// Mock users
const mockUsers = [
  { id: 1, name: 'Иван Петров', email: 'ivan@company.bg', role: 'consultant', status: 'active', lastLogin: '2024-01-25 14:30' },
  { id: 2, name: 'Мария Георгиева', email: 'maria@company.bg', role: 'manager', status: 'active', lastLogin: '2024-01-25 09:15' },
  { id: 3, name: 'Георги Димитров', email: 'georgi@company.bg', role: 'consultant', status: 'active', lastLogin: '2024-01-24 16:45' },
  { id: 4, name: 'Анна Стоянова', email: 'anna@company.bg', role: 'viewer', status: 'inactive', lastLogin: '2024-01-20 11:00' },
];

// Mock audit log
const mockAuditLog = [
  { id: 1, user: 'Иван Петров', action: 'create', resource: 'client', resourceId: 'Клиент #245', timestamp: '2024-01-25 14:32:15', ip: '192.168.1.100' },
  { id: 2, user: 'Мария Георгиева', action: 'update', resource: 'report', resourceId: 'Отчет Q4', timestamp: '2024-01-25 14:28:00', ip: '192.168.1.101' },
  { id: 3, user: 'Георги Димитров', action: 'view', resource: 'analytics', resourceId: 'Дашборд', timestamp: '2024-01-25 14:15:30', ip: '192.168.1.102' },
  { id: 4, user: 'Иван Петров', action: 'delete', resource: 'task', resourceId: 'Задача #89', timestamp: '2024-01-25 13:45:00', ip: '192.168.1.100' },
  { id: 5, user: 'Мария Георгиева', action: 'export', resource: 'report', resourceId: 'Месечен отчет', timestamp: '2024-01-25 12:30:00', ip: '192.168.1.101' },
  { id: 6, user: 'Система', action: 'login', resource: 'auth', resourceId: 'Иван Петров', timestamp: '2024-01-25 14:30:00', ip: '192.168.1.100' },
  { id: 7, user: 'Система', action: 'login_failed', resource: 'auth', resourceId: 'unknown@test.bg', timestamp: '2024-01-25 14:25:00', ip: '85.14.25.100' },
];

const actionLabels = {
  create: { label: 'Създаване', color: 'bg-green-100 text-green-700' },
  update: { label: 'Редакция', color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Изтриване', color: 'bg-red-100 text-red-700' },
  view: { label: 'Преглед', color: 'bg-slate-100 text-slate-700' },
  export: { label: 'Експорт', color: 'bg-purple-100 text-purple-700' },
  login: { label: 'Вход', color: 'bg-green-100 text-green-700' },
  login_failed: { label: 'Неуспешен вход', color: 'bg-red-100 text-red-700' },
  logout: { label: 'Изход', color: 'bg-slate-100 text-slate-700' },
};

export default function RBACManager({ currentUserRole = 'admin' }) {
  const [users, setUsers] = useState(mockUsers);
  const [auditLog, setAuditLog] = useState(mockAuditLog);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);

  // Check if current user can manage RBAC
  const canManageRBAC = currentUserRole === 'admin' || currentUserRole === 'manager';

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuditLog = auditLog.filter(log => 
    auditFilter === 'all' || log.action === auditFilter
  );

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    // Log the action
    const targetUser = users.find(u => u.id === userId);
    setAuditLog(prev => [{
      id: Date.now(),
      user: 'Текущ потребител',
      action: 'update',
      resource: 'user_role',
      resourceId: `${targetUser?.name} -> ${roles[newRole]?.name}`,
      timestamp: new Date().toLocaleString('bg-BG'),
      ip: '192.168.1.1'
    }, ...prev]);
  };

  const handleStatusToggle = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    ));
  };

  if (!canManageRBAC) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Нямате права за достъп до този модул</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Управление на достъпа
          </h2>
          <p className="text-slate-500">RBAC система и одит лог</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Потребители
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Роли и права
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Одит лог
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Търси потребител..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Добави потребител
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добави нов потребител</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Име</Label>
                    <Input placeholder="Пълно име" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@company.bg" />
                  </div>
                  <div className="space-y-2">
                    <Label>Роля</Label>
                    <Select defaultValue="consultant">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roles).map(([key, role]) => (
                          <SelectItem key={key} value={key}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Отказ</Button>
                    <Button className="bg-blue-600">Добави</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Потребител</TableHead>
                  <TableHead>Роля</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последен вход</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={user.role} 
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <Badge className={roles[user.role]?.color}>
                            {roles[user.role]?.name}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roles).map(([key, role]) => (
                            <SelectItem key={key} value={key}>
                              <Badge className={role.color}>{role.name}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleStatusToggle(user.id)}
                        />
                        <span className={`text-sm ${user.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                          {user.status === 'active' ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {user.lastLogin}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditPermissionsOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(roles).map(([key, role]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <Badge className={role.color}>{role.name}</Badge>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {modules.map((module) => {
                      const hasFullAccess = role.permissions.includes('all');
                      const modulePerms = role.permissions.filter(p => p.startsWith(module.id));
                      const hasAccess = hasFullAccess || modulePerms.length > 0;
                      
                      return (
                        <div key={module.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <module.icon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{module.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {hasFullAccess ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Пълен достъп</Badge>
                            ) : hasAccess ? (
                              modulePerms.map(p => {
                                const action = p.split('.')[1];
                                return (
                                  <Badge key={p} variant="outline" className="text-xs">
                                    {action === 'read' ? 'Четене' : 
                                     action === 'write' ? 'Писане' :
                                     action === 'write.own' ? 'Собствени' :
                                     action === 'read.own' ? 'Собствени' :
                                     action === 'delete' ? 'Изтриване' : action}
                                  </Badge>
                                );
                              })
                            ) : (
                              <Badge variant="outline" className="text-xs text-slate-400">Без достъп</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={auditFilter} onValueChange={setAuditFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Филтър по действие" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички действия</SelectItem>
                <SelectItem value="create">Създаване</SelectItem>
                <SelectItem value="update">Редакция</SelectItem>
                <SelectItem value="delete">Изтриване</SelectItem>
                <SelectItem value="view">Преглед</SelectItem>
                <SelectItem value="export">Експорт</SelectItem>
                <SelectItem value="login">Вход</SelectItem>
                <SelectItem value="login_failed">Неуспешен вход</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Експорт
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Време</TableHead>
                  <TableHead>Потребител</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Ресурс</TableHead>
                  <TableHead>IP адрес</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={actionLabels[log.action]?.color || 'bg-slate-100'}>
                        {actionLabels[log.action]?.label || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        <span className="text-slate-500">{log.resource}:</span> {log.resourceId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500 font-mono">{log.ip}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Права на {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Текуща роля: <Badge className={roles[selectedUser.role]?.color}>{roles[selectedUser.role]?.name}</Badge>
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Модулни права</Label>
                {modules.map((module) => (
                  <div key={module.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <module.icon className="h-4 w-4" />
                        <span className="font-medium">{module.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {module.actions.map((action) => (
                        <label key={action} className="flex items-center gap-2 p-2 rounded bg-slate-50 cursor-pointer">
                          <Switch defaultChecked={action === 'read'} />
                          <span className="text-sm">
                            {action === 'read' ? 'Четене' : 
                             action === 'write' ? 'Писане' :
                             action === 'delete' ? 'Изтриване' :
                             action === 'export' ? 'Експорт' :
                             action === 'invite' ? 'Покани' : action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>Отказ</Button>
                <Button className="bg-blue-600">Запази</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}