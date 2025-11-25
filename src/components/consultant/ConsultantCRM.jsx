import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockClients = [
  { id: 1, name: 'Иван Петров', email: 'ivan@example.com', phone: '+359 888 123 456', status: 'active', products: 3, lastContact: '2024-01-20', value: '15,000 €' },
  { id: 2, name: 'Мария Иванова', email: 'maria@example.com', phone: '+359 888 234 567', status: 'new', products: 0, lastContact: '2024-01-22', value: '0 €' },
  { id: 3, name: 'Георги Димитров', email: 'georgi@example.com', phone: '+359 888 345 678', status: 'active', products: 2, lastContact: '2024-01-18', value: '8,500 €' },
  { id: 4, name: 'Елена Стоянова', email: 'elena@example.com', phone: '+359 888 456 789', status: 'pending', products: 1, lastContact: '2024-01-21', value: '3,200 €' },
  { id: 5, name: 'Николай Тодоров', email: 'nikolay@example.com', phone: '+359 888 567 890', status: 'inactive', products: 1, lastContact: '2023-12-15', value: '5,000 €' },
];

const statusConfig = {
  active: { label: 'Активен', color: 'bg-green-100 text-green-700' },
  new: { label: 'Нов', color: 'bg-blue-100 text-blue-700' },
  pending: { label: 'В процес', color: 'bg-amber-100 text-amber-700' },
  inactive: { label: 'Неактивен', color: 'bg-slate-100 text-slate-700' },
};

export default function ConsultantCRM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търси клиент..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="active">Активни</SelectItem>
              <SelectItem value="new">Нови</SelectItem>
              <SelectItem value="pending">В процес</SelectItem>
              <SelectItem value="inactive">Неактивни</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Нов клиент
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добави нов клиент</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Име</Label>
                  <Input placeholder="Въведете име" />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input placeholder="Въведете фамилия" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input placeholder="+359 888 000 000" />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select defaultValue="new">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Нов</SelectItem>
                    <SelectItem value="pending">В процес</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Отказ</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Запази</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Общо клиенти</p>
            <p className="text-2xl font-bold">{mockClients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Активни</p>
            <p className="text-2xl font-bold text-green-600">{mockClients.filter(c => c.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Нови този месец</p>
            <p className="text-2xl font-bold text-blue-600">{mockClients.filter(c => c.status === 'new').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Обща стойност</p>
            <p className="text-2xl font-bold">31,700 €</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Контакт</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Продукти</TableHead>
                <TableHead>Стойност</TableHead>
                <TableHead>Последен контакт</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[client.status].color}>
                      {statusConfig[client.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.products}</TableCell>
                  <TableCell className="font-medium">{client.value}</TableCell>
                  <TableCell className="text-slate-500">{client.lastContact}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Преглед
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактирай
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Изтрий
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}