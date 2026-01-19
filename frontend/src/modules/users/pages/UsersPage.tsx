import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, UserFilters } from '@/modules/users/hooks/useUsers';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageFilters } from '@/shared/components/PageFilters';
import { DataTable, Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { DeactivateModal } from '@/shared/components/DeactivateModal';
import { Button } from '@/shared/components/button';
import { User } from '@/shared/types';
import { formatDateTime } from '@/shared/utils/helpers';
import { Users, Plus, Edit, UserX } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

const columns: Column<User>[] = [
  {
    key: 'fullName',
    header: 'Name',
    render: (u) => <span className="font-medium">{u.fullName}</span>,
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
    key: 'role',
    header: 'Role',
    render: (u) => (
      <span className="capitalize px-2 py-1 bg-muted rounded-md text-sm">
        {u.role}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (u) => <StatusBadge status={u.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (u) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(u.createdAt)}
      </span>
    ),
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    render: (u) => (
      <span className="text-muted-foreground text-sm">
        {formatDateTime(u.updatedAt)}
      </span>
    ),
  },
];

export default function UsersPage() {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    deactivateUser
  } = useUsers();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        updateFilters({ search: searchTerm || undefined, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, updateFilters]);
  
  const handleOpenCreate = () => {
    navigate('/users/new');
  };

  const handleOpenEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeactivate = (user: User) => {
    setDeactivateModal({ isOpen: true, user });
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal.user) return;

    try {
      await deactivateUser(deactivateModal.user.id);
      toast({ title: 'User deactivated successfully' });
    } catch (error: any) {
      toast({ title: error.response.data.message || 'Error deactivating user', variant: 'destructive' });
    }
  };

  const columnsWithActions: Column<User>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(u);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {u.status === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivate(u);
              }}
            >
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const hasActiveFilters = Boolean(searchTerm || filters.role || filters.status);

  const handleRoleFilter = (role: string) => {
    updateFilters({ role: role === 'all' ? undefined : role.toUpperCase(), page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    updateFilters({ status: status === 'all' ? undefined : status.toUpperCase(), page: 1 });
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortBy, sortOrder: newSortOrder, page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm('');
    resetFilters();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        description="Manage system users and their roles"
        action={
          <Button onClick={handleOpenCreate} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <PageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'operator', label: 'Operator' },
              { value: 'viewer', label: 'Viewer' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        filterValues={{
          role: filters.role?.toLowerCase() || 'all',
          status: filters.status?.toLowerCase() || 'all',
        }}
        onFilterChange={(key, value) => {
          if (key === 'role') {
            handleRoleFilter(value);
          } else if (key === 'status') {
            handleStatusFilter(value);
          }
        }}
        onClearFilters={clearFilters}
        isFilterOpen={showFilters}
        onFilterOpenChange={setShowFilters}
        totalCount={pagination?.totalCount || users.length}
        filteredCount={users.length}
        hasActiveFilters={hasActiveFilters}
      />

      {users.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Create your first user to get started"
          action={{
            label: 'Add User',
            onClick: handleOpenCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columnsWithActions}
          data={users}
          isLoading={isLoading}
          rowKey={(u) => u.id}
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
        title="Deactivate User"
        description="Are you sure you want to deactivate this user? They will lose access to the system."
        itemName={deactivateModal.user?.fullName || ''}
      />
    </div>
  );
}
