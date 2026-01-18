import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSenders } from '@/hooks/useSenders';
import { Button } from '@/components/ui/button';
import { useReceivers } from '@/hooks/useReceivers';
import { Transaction, TransactionStatus } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { DataTable, Column } from '@/components/common/DataTable';
import { FileText, Filter, Download, X, ArrowUpRight, Eye } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const getColumns = (onViewDetails: (transaction: Transaction) => void): Column<Transaction>[] => [
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
    className: 'w-32',
    render: (t) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onViewDetails(t)}
        >
          <Eye className="mr-1 h-3 w-3" />
          View Details
        </Button>
      </div>
    ),
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
  const { transactions, isLoading, filters, updateFilters, clearFilters } = useTransactions();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { senders } = useSenders(isFilterOpen); // Only load when filter is open
  const { receivers } = useReceivers(undefined, isFilterOpen); // Only load when filter is open
  
  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    senderId: filters.senderId || 'all',
    receiverId: filters.receiverId || 'all',
    status: filters.status || 'all',
    minAmount: filters.minAmount?.toString() || '',
    maxAmount: filters.maxAmount?.toString() || '',
  });

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  const handleApplyFilters = () => {
    updateFilters({
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
      senderId: localFilters.senderId === 'all' ? undefined : localFilters.senderId,
      receiverId: localFilters.receiverId === 'all' ? undefined : localFilters.receiverId,
      status: localFilters.status === 'all' ? undefined : localFilters.status as TransactionStatus,
      minAmount: localFilters.minAmount ? parseFloat(localFilters.minAmount) : undefined,
      maxAmount: localFilters.maxAmount ? parseFloat(localFilters.maxAmount) : undefined,
    });
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
        columns={getColumns(handleViewDetails)}
        data={transactions}
        isLoading={isLoading}
        rowKey={(t) => t.id}
        emptyMessage="No transactions match your filters"
      />

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
    </div>
  );
}
