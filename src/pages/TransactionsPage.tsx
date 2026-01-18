import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSenders } from '@/hooks/useSenders';
import { useReceivers } from '@/hooks/useReceivers';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Transaction, TransactionStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { FileText, Filter, Download, X, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const columns: Column<Transaction>[] = [
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
  const { senders } = useSenders();
  const { receivers } = useReceivers();
  
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
          action={{
            label: 'Send Money',
            onClick: () => {},
          }}
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
            <Sheet>
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
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        rowKey={(t) => t.id}
        emptyMessage="No transactions match your filters"
      />
    </div>
  );
}
