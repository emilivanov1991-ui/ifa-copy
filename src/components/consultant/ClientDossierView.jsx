import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  X,
  User,
  Mail,
  Phone
} from 'lucide-react';
import ClientDossier from '../portal/ClientDossier';

export default function ClientDossierView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['all-clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return client.first_name?.toLowerCase().includes(searchLower) ||
           client.last_name?.toLowerCase().includes(searchLower) ||
           client.email?.toLowerCase().includes(searchLower);
  });

  const handleViewDossier = (client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Търси клиент по име, фамилия или имейл..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            Зареждане на клиенти...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Няма намерени клиенти</p>
          </div>
        ) : (
          filteredClients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewDossier(client)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {client.first_name?.[0]}{client.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {client.first_name} {client.last_name}
                        </h3>
                        <p className="text-xs text-slate-500">ID: {client.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Регистриран: {new Date(client.created_date).toLocaleDateString('bg-BG')}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Досие
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Dossier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                Досие на клиент: {selectedClient?.first_name} {selectedClient?.last_name}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          {selectedClient && (
            <ClientDossier clientId={selectedClient.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}