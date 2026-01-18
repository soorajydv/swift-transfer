import { useNavigate } from 'react-router-dom';
import { useReceivers } from '@/hooks/useReceivers';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Receiver } from '@/types';
import { formatDateTime, maskData } from '@/utils/helpers';
import { UserPlus, Plus, Edit, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const columns: Column<Receiver>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (r) => <span className="font-medium">{r.fullName}</span>,
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'bankName',
    header: 'Bank',
  },
  {
    key: 'accountNumber',
    header: 'Account',
    render: (r) => (
      <span className="font-mono text-sm">{maskData(r.accountNumber)}</span>
    ),
  },
  {
    key: 'city',
    header: 'City',
  },
  {
    key: 'relationship',
    header: 'Relationship',
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge status={r.status} />,
  },
];

export default function ReceiversPage() {
  const navigate = useNavigate();
  const { receivers, isLoading, deactivateReceiver } = useReceivers();
  const { toast } = useToast();

  const handleCreate = () => {
    navigate('/receivers/new');
  };

  const handleEdit = (receiver: Receiver) => {
    navigate(`/receivers/${receiver.id}/edit`);
  };

  const handleDeactivate = async (receiver: Receiver) => {
    if (!confirm(`Are you sure you want to deactivate ${receiver.fullName}?`)) return;

    try {
      await deactivateReceiver(receiver.id);
      toast({ title: 'Receiver deactivated successfully' });
    } catch {
      toast({ title: 'Error deactivating receiver', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<Receiver>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(r);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {r.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(r);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (receivers.length === 0 && !isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Receivers" description="Manage receiver profiles" />
        <EmptyState
          icon={UserPlus}
          title="No receivers found"
          description="Add your first receiver in Nepal to start sending money"
          action={{
            label: 'Add Receiver',
            onClick: handleCreate,
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Receivers"
        description="Manage receiver profiles in Nepal"
        action={
          <Button onClick={handleCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Receiver
          </Button>
        }
      />

      <DataTable
        columns={columnsWithActions}
        data={receivers}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyMessage="No receivers found"
      />
    </div>
  );
}
