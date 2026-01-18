import { useNavigate } from 'react-router-dom';
import { useSenders } from '@/hooks/useSenders';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Sender } from '@/types';
import { formatDateTime, maskData } from '@/utils/helpers';
import { UserCheck, Plus, Edit, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const columns: Column<Sender>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (s) => <span className="font-medium">{s.fullName}</span>,
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'city',
    header: 'City',
  },
  {
    key: 'identityNumber',
    header: 'ID Number',
    render: (s) => (
      <span className="font-mono text-sm">{maskData(s.identityNumber)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => <StatusBadge status={s.status} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    render: (s) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(s.updatedAt)}
      </span>
    ),
  },
];

export default function SendersPage() {
  const navigate = useNavigate();
  const { senders, isLoading, deactivateSender } = useSenders();
  const { toast } = useToast();

  const handleCreate = () => {
    navigate('/senders/new');
  };

  const handleEdit = (sender: Sender) => {
    navigate(`/senders/${sender.id}/edit`);
  };

  const handleDeactivate = async (sender: Sender) => {
    if (!confirm(`Are you sure you want to deactivate ${sender.fullName}?`)) return;

    try {
      await deactivateSender(sender.id);
      toast({ title: 'Sender deactivated successfully' });
    } catch {
      toast({ title: 'Error deactivating sender', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<Sender>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(s);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {s.status !== 'inactive' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(s);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (senders.length === 0 && !isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Senders" description="Manage sender profiles" />
        <EmptyState
          icon={UserCheck}
          title="No senders found"
          description="Register your first sender to start sending money"
          action={{
            label: 'Add Sender',
            onClick: handleCreate,
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Senders"
        description="Manage sender profiles from Japan"
        action={
          <Button onClick={handleCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add Sender
          </Button>
        }
      />

      <DataTable
        columns={columnsWithActions}
        data={senders}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        emptyMessage="No senders found"
      />
    </div>
  );
}
