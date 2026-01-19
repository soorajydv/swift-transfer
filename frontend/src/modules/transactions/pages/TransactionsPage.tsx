import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Textarea } from '@/shared/components/textarea';
import { useSenders } from '@/modules/senders/hooks/useSenders';
import { Button } from '@/shared/components/button';
import { useReceivers } from '@/modules/receivers/hooks/useReceivers';
import { Transaction, TransactionStatus } from '@/shared/types';
import { useTransactions } from '@/modules/transactions/hooks/useTransactions';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/shared/utils/helpers';
import { DataTable, Column } from '@/shared/components/DataTable';
import { FileText, Filter, Download, X, ArrowUpRight, Eye, Play, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/dialog';
import { useToast } from '@/shared/hooks/use-toast';

const getColumns = (
  onViewDetails: (transaction: Transaction) => void,
  onProcess: (transaction: Transaction) => void,
  onComplete: (transaction: Transaction) => void,
  onCancel: (transaction: Transaction) => void
): Column<Transaction>[] => [
  {
    key: 'transactionId',
    header: 'Transaction ID',
    render: (t) => (
      <span className="font-mono text-sm">{t.transactionId}</span>
    ),
  },
  {
    key: 'senderName',
    header: 'Sender',
    render: (t) => <span className="font-medium">{t.senderName}</span>,
  },
  {
    key: 'receiverName',
    header: 'Receiver',
    render: (t) => <span className="font-medium">{t.receiverName}</span>,
  },
  {
    key: 'amountJPY',
    header: 'Amount (JPY)',
    render: (t) => (
      <span className="font-medium">{formatCurrency(t.amountJPY, 'JPY')}</span>
    ),
  },
  {
    key: 'amountNPR',
    header: 'Amount (NPR)',
    render: (t) => (
      <span className="text-success">{formatCurrency(t.amountNPR, 'NPR')}</span>
    ),
  },
  {
    key: 'serviceFee',
    header: 'Service Fee',
    render: (t) => (
      <span className="text-muted-foreground">
        {formatCurrency(t.serviceFee, 'NPR')}
      </span>
    ),
  },
  {
    key: 'purpose',
    header: 'Purpose',
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => <StatusBadge status={t.status} />,
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (t) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(t.createdAt)}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    className: 'w-48',
    render: (t) => {
      const actions = [];

      // View Details - always available
      actions.push(
        <Button
          key="view"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onViewDetails(t)}
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
      );

      // Status-based actions
      if (t.status === 'pending') {
        actions.push(
          <Button
            key="process"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-600 hover:text-blue-700"
            onClick={() => onProcess(t)}
          >
            <Play className="mr-1 h-3 w-3" />
            Process
          </Button>
        );
        actions.push(
          <Button
            key="cancel"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-red-600 hover:text-red-700"
            onClick={() => onCancel(t)}
          >
            <Ban className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        );
      } else if (t.status === 'processing') {
        actions.push(
          <Button
            key="complete"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-green-600 hover:text-green-700"
            onClick={() => onComplete(t)}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Complete
          </Button>
        );
        actions.push(
          <Button
            key="cancel"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-red-600 hover:text-red-700"
            onClick={() => onCancel(t)}
          >
            <Ban className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        );
      }

      return (
        <div className="flex items-center gap-1 flex-wrap">
          {actions}
        </div>
      );
    },
  },
];

const statusOptions: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    updateTransactionStatus,
    cancelTransaction
  } = useTransactions();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    transaction?: Transaction;
    action?: 'process' | 'complete' | 'cancel';
    cancelReason?: string;
  }>({ isOpen: false });
  const { senders } = useSenders(true, { page: 1, limit: 100 }); // Always load with higher limit for dropdowns
  const { receivers } = useReceivers(undefined, true, { page: 1, limit: 100 }); // Always load with higher limit for dropdowns
  const { toast } = useToast();

  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    senderId: filters.senderId || 'all',
    receiverId: filters.receiverId || 'all',
    status: filters.status || 'all',
    minAmount: filters.minAmount?.toString() || '',
    maxAmount: filters.maxAmount?.toString() || '',
  });

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== null && v !== '');

  // Update filters when local filter values change
  useEffect(() => {
    const statusValue = localFilters.status === 'all' ? undefined : localFilters.status;
    const senderValue = localFilters.senderId === 'all' ? undefined : localFilters.senderId;
    const receiverValue = localFilters.receiverId === 'all' ? undefined : localFilters.receiverId;
    const startDateValue = localFilters.startDate || undefined;
    const endDateValue = localFilters.endDate || undefined;
    const minAmountValue = localFilters.minAmount ? parseFloat(localFilters.minAmount) : undefined;
    const maxAmountValue = localFilters.maxAmount ? parseFloat(localFilters.maxAmount) : undefined;

    if (
      statusValue !== filters.status ||
      senderValue !== filters.senderId ||
      receiverValue !== filters.receiverId ||
      startDateValue !== filters.startDate ||
      endDateValue !== filters.endDate ||
      minAmountValue !== filters.minAmount ||
      maxAmountValue !== filters.maxAmount
    ) {
      updateFilters({
        status: statusValue as TransactionStatus,
        senderId: senderValue,
        receiverId: receiverValue,
        startDate: startDateValue,
        endDate: endDateValue,
        minAmount: minAmountValue,
        maxAmount: maxAmountValue,
        page: 1 // Reset to first page when filters change
      });
    }
  }, [localFilters, filters, updateFilters]);

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect above
    // This function can be used for any additional logic if needed
  };

  const handleClearFilters = () => {
    setLocalFilters({
      startDate: '',
      endDate: '',
      senderId: 'all',
      receiverId: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: '',
    });
    clearFilters();
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const handleProcess = (transaction: Transaction) => {
    setStatusChangeModal({ isOpen: true, transaction, action: 'process' });
  };

  const handleComplete = (transaction: Transaction) => {
    setStatusChangeModal({ isOpen: true, transaction, action: 'complete' });
  };

  const handleCancel = (transaction: Transaction) => {
    setStatusChangeModal({ isOpen: true, transaction, action: 'cancel' });
  };

  const confirmStatusChange = async () => {
    if (!statusChangeModal.transaction || !statusChangeModal.action) return;

    const { transaction, action } = statusChangeModal;

    try {
      let response;

      switch (action) {
        case 'process':
          response = await updateTransactionStatus(transaction.id, 'processing');
          break;
        case 'complete':
          response = await updateTransactionStatus(transaction.id, 'completed');
          break;
        case 'cancel':
          // Get the cancellation reason from the textarea
          const cancelReasonElement = document.getElementById('cancelReason') as HTMLTextAreaElement;
          const cancelReason = cancelReasonElement?.value || 'Cancelled by administrator';
          response = await cancelTransaction(transaction.id, cancelReason);
          break;
        default:
          return;
      }

      if (response.success) {
        toast({
          title: `Transaction ${action}d successfully`,
          description: `Transaction ${transaction.transactionId} has been ${action}d.`
        });
        setStatusChangeModal({ isOpen: false });
      } else {
        toast({
          title: `Failed to ${action} transaction`,
          description: response.error || 'An error occurred',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      toast({
        title: `Failed to ${action} transaction`,
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Transaction ID',
      'Sender',
      'Receiver',
      'Amount (JPY)',
      'Amount (NPR)',
      'Service Fee',
      'Exchange Rate',
      'Purpose',
      'Status',
      'Date',
    ];

    const rows = transactions.map((t) => [
      t.transactionId,
      t.senderName,
      t.receiverName,
      t.amountJPY,
      t.amountNPR,
      t.serviceFee,
      t.exchangeRate,
      t.purpose,
      t.status,
      formatDateTime(t.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const stats = {
    total: transactions.length,
    totalJPY: transactions.reduce((sum, t) => sum + t.amountJPY, 0),
    totalNPR: transactions.reduce((sum, t) => sum + t.amountNPR, 0),
    totalFees: transactions.reduce((sum, t) => sum + t.serviceFee, 0),
  };

  if (transactions.length === 0 && !isLoading && !hasActiveFilters) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Transactions" description="View and manage transactions" />
        <EmptyState
          icon={FileText}
          title="No transactions yet"
          description="Start by sending money to see your transaction history"
        >
          <Link to="/send-money">
            <Button className="btn-gradient mt-4">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Send Money
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transactions"
        description="View and filter transaction history"
        action={
          <div className="flex items-center gap-3">
            <Sheet onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Transactions</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={localFilters.startDate}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            startDate: e.target.value,
                          })
                        }
                        placeholder="Start date"
                      />
                      <Input
                        type="date"
                        value={localFilters.endDate}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            endDate: e.target.value,
                          })
                        }
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sender</Label>
                    <Select
                      value={localFilters.senderId}
                      onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, senderId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All senders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Senders</SelectItem>
                        {senders.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Receiver</Label>
                    <Select
                      value={localFilters.receiverId}
                      onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, receiverId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All receivers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Receivers</SelectItem>
                        {receivers.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={localFilters.status}
                      onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount Range (JPY)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={localFilters.minAmount}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            minAmount: e.target.value,
                          })
                        }
                        placeholder="Min"
                      />
                      <Input
                        type="number"
                        value={localFilters.maxAmount}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            maxAmount: e.target.value,
                          })
                        }
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleClearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <Button className="flex-1" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Volume (JPY)</p>
          <p className="text-xl font-bold">{formatCurrency(stats.totalJPY, 'JPY')}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Volume (NPR)</p>
          <p className="text-xl font-bold text-success">
            {formatCurrency(stats.totalNPR, 'NPR')}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Fees</p>
          <p className="text-xl font-bold">{formatCurrency(stats.totalFees, 'NPR')}</p>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 text-primary"
          >
            Clear all
          </Button>
        </div>
      )}

      <DataTable
        columns={getColumns(handleViewDetails, handleProcess, handleComplete, handleCancel)}
        data={transactions}
        isLoading={isLoading}
        rowKey={(t) => t.id}
        emptyMessage="No transactions match your filters"
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedTransaction.status} />
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sender</label>
                  <p className="font-medium">{selectedTransaction.senderName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Receiver</label>
                  <p className="font-medium">{selectedTransaction.receiverName}</p>
                </div>
              </div>

              {/* Amounts */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount (JPY)</label>
                    <p className="text-lg font-bold">{formatCurrency(selectedTransaction.amountJPY, 'JPY')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount (NPR)</label>
                    <p className="text-lg font-bold text-success">{formatCurrency(selectedTransaction.amountNPR, 'NPR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Service Fee</label>
                    <p className="text-lg font-bold">{formatCurrency(selectedTransaction.serviceFee, 'NPR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Exchange Rate</label>
                    <p>1 JPY = {selectedTransaction.exchangeRate} NPR</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="text-lg font-bold text-primary">{formatCurrency(selectedTransaction.totalAmountJPY, 'JPY')}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                  <p>{selectedTransaction.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Created</label>
                  <p>{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-xs">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
                {selectedTransaction.processedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Processed</label>
                    <p className="text-xs">{formatDateTime(selectedTransaction.processedAt)}</p>
                  </div>
                )}
                {selectedTransaction.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed</label>
                    <p className="text-xs">{formatDateTime(selectedTransaction.completedAt)}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.cancelledAt && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Cancelled</label>
                  <p className="text-xs">{formatDateTime(selectedTransaction.cancelledAt)}</p>
                  {selectedTransaction.cancelledReason && (
                    <p className="text-sm text-muted-foreground mt-1">Reason: {selectedTransaction.cancelledReason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Modal */}
      <Dialog open={statusChangeModal.isOpen} onOpenChange={() => setStatusChangeModal({ isOpen: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusChangeModal.action === 'process' && 'Process Transaction'}
              {statusChangeModal.action === 'complete' && 'Complete Transaction'}
              {statusChangeModal.action === 'cancel' && 'Cancel Transaction'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to{' '}
              <strong className="text-foreground">
                {statusChangeModal.action} this transaction
              </strong>
              ?
            </p>

            {statusChangeModal.transaction && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Transaction {statusChangeModal.transaction.transactionId}
                  </span>
                  <StatusBadge status={statusChangeModal.transaction.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusChangeModal.transaction.senderName} → {statusChangeModal.transaction.receiverName}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(statusChangeModal.transaction.amountJPY, 'JPY')}
                </p>
              </div>
            )}

            {statusChangeModal.action === 'cancel' && (
              <div className="mt-4">
                <Label htmlFor="cancelReason" className="text-sm font-medium">
                  Cancellation Reason (Optional)
                </Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Enter reason for cancellation..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusChangeModal({ isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className={
                statusChangeModal.action === 'cancel'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary'
              }
            >
              {statusChangeModal.action === 'process' && 'Process Transaction'}
              {statusChangeModal.action === 'complete' && 'Complete Transaction'}
              {statusChangeModal.action === 'cancel' && 'Cancel Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
