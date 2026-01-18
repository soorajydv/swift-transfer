import { useDashboard } from '@/hooks/useDashboard';
import { useTransactions } from '@/hooks/useTransactions';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, Column } from '@/components/common/DataTable';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Activity, Wallet, ArrowUpRight, Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const recentTransactionsColumns: Column<Transaction>[] = [
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
    header: 'Amount',
    render: (t) => (
      <div>
        <div className="font-medium">{formatCurrency(t.amountJPY, 'JPY')}</div>
        <div className="text-xs text-muted-foreground">
          {formatCurrency(t.amountNPR, 'NPR')}
        </div>
      </div>
    ),
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
      <span className="text-muted-foreground">{formatDateTime(t.createdAt)}</span>
    ),
  },
];

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useDashboard();
  const { transactions, isLoading: txLoading } = useTransactions();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your money transfer operations"
        action={
          <Link to="/send-money">
            <Button className="btn-gradient">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Send Money
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions ?? '-'}
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="Total Volume (JPY)"
          value={stats ? formatCurrency(stats.totalVolumeJPY, 'JPY') : '-'}
          subtitle={stats ? `≈ ${formatCurrency(stats.totalVolumeNPR, 'NPR')}` : ''}
          icon={Wallet}
        />
        <StatCard
          title="Pending Transactions"
          value={stats?.pendingTransactions ?? '-'}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday ?? '-'}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Users"
          value={stats?.activeUsers ?? '-'}
          icon={Users}
        />
        <StatCard
          title="Active Senders"
          value={stats?.activeSenders ?? '-'}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Service Fees"
          value={stats ? formatCurrency(stats.totalServiceFees, 'NPR') : '-'}
          icon={Wallet}
          variant="success"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </div>

        <DataTable
          columns={recentTransactionsColumns}
          data={recentTransactions}
          isLoading={statsLoading || txLoading}
          rowKey={(t) => t.id}
          emptyMessage="No transactions yet"
        />
      </div>
    </div>
  );
}
