import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReceivers } from '@/modules/receivers/hooks/useReceivers';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageFilters } from '@/shared/components/PageFilters';
import { DataTable, Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { DeactivateModal } from '@/shared/components/DeactivateModal';
import { Button } from '@/shared/components/button';
import { Receiver } from '@/shared/types';
import { formatDateTime, maskData } from '@/shared/utils/helpers';
import { UserPlus, Plus, Edit, UserX } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

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
  const {
    receivers,
    isLoading,
    pagination,
    filters,
    updateFilters,
    changePage,
    deactivateReceiver
  } = useReceivers();
  const { toast } = useToast();

  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    receiver?: Receiver;
  }>({ isOpen: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
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
    const bankValue = bankFilter === 'all' ? undefined : bankFilter;
    const cityValue = cityFilter === 'all' ? undefined : cityFilter;

    if (statusValue !== filters.status || bankValue !== filters.bank || cityValue !== filters.city) {
      updateFilters({ status: statusValue, bank: bankValue, city: cityValue, page: 1 });
    }
  }, [statusFilter, bankFilter, cityFilter, filters.status, filters.bank, filters.city, updateFilters]);

  // Get unique banks and cities for filter dropdowns
  const uniqueBanks = useMemo(() => {
    const banks = [...new Set(receivers.map(r => r.bankName))].sort();
    return banks;
  }, [receivers]);

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(receivers.map(r => r.city))].sort();
    return cities;
  }, [receivers]);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || bankFilter !== 'all' || cityFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBankFilter('all');
    setCityFilter('all');
  };

  const handleCreate = () => {
    navigate('/receivers/new');
  };

  const handleEdit = (receiver: Receiver) => {
    navigate(`/receivers/${receiver.id}/edit`);
  };

  const handleDeactivate = (receiver: Receiver) => {
    setDeactivateModal({ isOpen: true, receiver });
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal.receiver) return;

    try {
      await deactivateReceiver(deactivateModal.receiver.id);
      toast({ title: 'Receiver deactivated successfully' });
    } catch (error: any) {
      toast({ title: error.response.data.message || 'Error deactivating receiver', variant: 'destructive' });
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

      <PageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, phone, bank, city, or relationship..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
          {
            key: 'bank',
            label: 'Bank',
            options: [
              { value: 'all', label: 'All Banks' },
              ...uniqueBanks.map((bank) => ({ value: bank, label: bank })),
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
          bank: bankFilter,
          city: cityFilter,
        }}
        onFilterChange={(key, value) => {
          if (key === 'status') {
            setStatusFilter(value);
          } else if (key === 'bank') {
            setBankFilter(value);
          } else if (key === 'city') {
            setCityFilter(value);
          }
        }}
        onClearFilters={clearFilters}
        isFilterOpen={isFilterOpen}
        onFilterOpenChange={setIsFilterOpen}
        totalCount={pagination?.totalCount || receivers.length}
        filteredCount={receivers.length}
        hasActiveFilters={Boolean(hasActiveFilters)}
      />

      {receivers.length === 0 && !isLoading ? (
        <EmptyState
          icon={UserPlus}
          title="No receivers found"
          description="Add your first receiver in Nepal to start sending money"
          action={{
            label: 'Add Receiver',
            onClick: handleCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columnsWithActions}
          data={receivers}
          isLoading={isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No receivers found"
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

      {/* Deactivate Modal */}
      <DeactivateModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false })}
        onConfirm={confirmDeactivate}
        title="Deactivate Receiver"
        description="Are you sure you want to deactivate this receiver? They will no longer be able to receive money."
        itemName={deactivateModal.receiver?.fullName || ''}
      />
    </div>
  );
}
