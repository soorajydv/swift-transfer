import { useState, useEffect, useMemo } from 'react';
import { useSenders } from '@/modules/senders/hooks/useSenders';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageFilters } from '@/shared/components/PageFilters';
import { DataTable, Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { DeactivateModal } from '@/shared/components/DeactivateModal';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/sheet';
import { SenderForm } from '@/modules/senders/components/SenderForm';
import { Dialog, DialogContent } from '@/shared/components/dialog';
import { Sender } from '@/shared/types';
import { formatDateTime, maskData } from '@/shared/utils/helpers';
import { UserCheck, Plus, Edit, UserX, Search, Filter, X } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

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
  const {
    senders,
    isLoading,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    changePage,
    deactivateSender
  } = useSenders();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSender, setEditingSender] = useState<Sender | undefined>();
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    sender?: Sender;
  }>({ isOpen: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Debounced search - trigger API call when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        updateFilters({ search: searchTerm || undefined, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, updateFilters]);

  // Update filters when local filter values change
  useEffect(() => {
    const statusValue = statusFilter === 'all' ? undefined : statusFilter;
    const cityValue = cityFilter === 'all' ? undefined : cityFilter;

    if (statusValue !== filters.status || cityValue !== filters.city) {
      updateFilters({ status: statusValue, city: cityValue, page: 1 });
    }
  }, [statusFilter, cityFilter, filters.status, filters.city, updateFilters]);

  // Get unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(senders.map(s => s.city))].sort();
    return cities;
  }, [senders]);

  const hasActiveFilters = Boolean(searchTerm || statusFilter !== 'all' || cityFilter !== 'all');

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCityFilter('all');
  };

  const handleCreate = () => {
    setEditingSender(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (sender: Sender) => {
    setEditingSender(sender);
    setIsModalOpen(true);
  };

  const handleDeactivate = (sender: Sender) => {
    setDeactivateModal({ isOpen: true, sender });
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal.sender) return;

    try {
      await deactivateSender(deactivateModal.sender.id);
      toast({ title: 'Sender deactivated successfully' });
    } catch (error: any) {
      toast({ title: error.response.data.message || 'Error deactivating sender', variant: 'destructive' });
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

      <PageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, email, phone, or city..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending_verification', label: 'Pending Verification' },
            ],
          },
          {
            key: 'city',
            label: 'City',
            options: [
              { value: 'all', label: 'All Cities' },
              ...uniqueCities.map((city) => ({ value: city, label: city })),
            ],
          },
        ]}
        filterValues={{
          status: statusFilter,
          city: cityFilter,
        }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setStatusFilter(value);
          } else if (key === 'city') {
            setCityFilter(value);
          }
        }}
        onClearFilters={clearFilters}
        isFilterOpen={isFilterOpen}
        onFilterOpenChange={setIsFilterOpen}
        totalCount={pagination?.totalCount || senders.length}
        filteredCount={senders.length}
        hasActiveFilters={hasActiveFilters}
      />

      {senders.length === 0 && !isLoading ? (
        <EmptyState
          icon={UserCheck}
          title="No senders found"
          description="Register your first sender to start sending money"
          action={{
            label: 'Add Sender',
            onClick: handleCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columnsWithActions}
          data={senders}
          isLoading={isLoading}
          rowKey={(s) => s.id}
          emptyMessage="No senders found"
        />
      )}

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SenderForm
            editingSender={editingSender}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Deactivate Modal */}
      <DeactivateModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false })}
        onConfirm={confirmDeactivate}
        title="Deactivate Sender"
        description="Are you sure you want to deactivate this sender? They will lose access to the system."
        itemName={deactivateModal.sender?.fullName || ''}
      />
    </div>
  );
}
