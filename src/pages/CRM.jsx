import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Target,
  FileText,
  X,
  Loader2,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700'
};

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  converted: 'Converted',
  closed: 'Closed'
};

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['financial-leads'],
    queryFn: () => base44.entities.FinancialAnalysisSubmission.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinancialAnalysisSubmission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-leads'] });
    },
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    inProgress: leads.filter(l => l.status === 'in_progress' || l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    if (selectedLead) {
      updateMutation.mutate({ 
        id: selectedLead.id, 
        data: { status: newStatus } 
      });
      setSelectedLead(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleNotesChange = (notes) => {
    if (selectedLead) {
      updateMutation.mutate({ 
        id: selectedLead.id, 
        data: { notes } 
      });
      setSelectedLead(prev => ({ ...prev, notes }));
    }
  };

  const handleAdvisorChange = (advisor) => {
    if (selectedLead) {
      updateMutation.mutate({ 
        id: selectedLead.id, 
        data: { assigned_advisor: advisor } 
      });
      setSelectedLead(prev => ({ ...prev, assigned_advisor: advisor }));
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Lead Management</h1>
          <p className="text-slate-600 font-light">Manage financial analysis submissions and track leads</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Leads</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">New Leads</p>
                <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">In Progress</p>
                <p className="text-3xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Converted</p>
                <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-lg">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No leads found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Risk Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => openLeadDetails(lead)}
                  >
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-sm text-slate-500">{lead.occupation || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.email}</div>
                      <div className="text-sm text-slate-500">{lead.phone || '-'}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lead.annual_income)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{lead.risk_tolerance || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("font-medium", statusColors[lead.status || 'new'])}>
                        {statusLabels[lead.status || 'new']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {format(new Date(lead.created_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Lead Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">
                  {selectedLead.first_name} {selectedLead.last_name}
                </SheetTitle>
                <Badge className={cn("w-fit", statusColors[selectedLead.status || 'new'])}>
                  {statusLabels[selectedLead.status || 'new']}
                </Badge>
              </SheetHeader>

              <div className="space-y-6">
                {/* Status Update */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Update Status</label>
                  <Select value={selectedLead.status || 'new'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assigned Advisor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Assigned Advisor</label>
                  <Input
                    placeholder="Enter advisor name"
                    value={selectedLead.assigned_advisor || ''}
                    onChange={(e) => handleAdvisorChange(e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                {/* Contact Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4" /> Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <p className="font-medium">{selectedLead.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Age</p>
                      <p className="font-medium">{selectedLead.age || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Marital Status</p>
                      <p className="font-medium capitalize">{selectedLead.marital_status?.replace('_', ' ') || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Financial Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Annual Income</p>
                      <p className="font-medium">{formatCurrency(selectedLead.annual_income)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Monthly Expenses</p>
                      <p className="font-medium">{formatCurrency(selectedLead.monthly_expenses)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Total Savings</p>
                      <p className="font-medium">{formatCurrency(selectedLead.total_savings)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Total Debt</p>
                      <p className="font-medium">{formatCurrency(selectedLead.total_debt)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Retirement Accounts</p>
                      <p className="font-medium">{formatCurrency(selectedLead.retirement_accounts)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Owns Home</p>
                      <p className="font-medium">{selectedLead.owns_home ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Goals & Preferences
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-500">Risk Tolerance</p>
                      <p className="font-medium capitalize">{selectedLead.risk_tolerance || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Timeline</p>
                      <p className="font-medium capitalize">{selectedLead.investment_timeline?.replace('_', ' ') || '-'}</p>
                    </div>
                  </div>
                  {selectedLead.primary_goals?.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-sm mb-2">Primary Goals</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.primary_goals.map((goal) => (
                          <Badge key={goal} variant="secondary" className="bg-blue-100 text-blue-700">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                {selectedLead.additional_notes && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Client Notes</h4>
                    <p className="text-sm text-slate-600">{selectedLead.additional_notes}</p>
                  </div>
                )}

                {/* Internal Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Internal Notes</label>
                  <Textarea
                    placeholder="Add notes about this lead..."
                    value={selectedLead.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={4}
                    className="rounded-lg resize-none"
                  />
                </div>

                {/* Submission Date */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Submitted on {format(new Date(selectedLead.created_date), 'MMMM d, yyyy \'at\' h:mm a')}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}