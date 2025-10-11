import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import {
  usePartners,
  useDeletePartner,
  type PartnerFilters,
} from './partners.api';
import { PartnerCard } from './partner-card.component';
import { PartnerFiltersComponent } from './partner-filters.component';

export default function PartnersListPage() {
  const [filters, setFilters] = useState<PartnerFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // API calls
  const {
    data: partnersResponse,
    isLoading,
    error,
    refetch,
  } = usePartners(filters, currentPage, pageSize);

  const deletePartnerMutation = useDeletePartner();

  const partners = partnersResponse?.data || [];
  const totalCount = partnersResponse?.total || 0;
  const totalPages =
    partnersResponse?.totalPages || Math.ceil(totalCount / pageSize);

  const handleFiltersChange = (newFilters: PartnerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await deletePartnerMutation.mutateAsync(partnerId);
      } catch (error) {
        console.error('Failed to delete partner:', error);
      }
    }
  };

  const handleEditPartner = (partner: any) => {
    // TODO: Implement edit partner functionality
    console.log('Edit partner:', partner);
  };

  const handleViewPartner = (partner: any) => {
    // TODO: Implement view partner functionality
    console.log('View partner:', partner);
  };

  const handleCreatePartner = () => {
    // TODO: Implement create partner functionality
    console.log('Create new partner');
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Error loading partners
          </h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <Header
        title="Partners"
        subtitle="Manage your business partners and relationships"
        showBackButton={true}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-stone-800">
              Partner Directory
            </h2>
            <p className="text-stone-600 text-sm">
              View and manage all your business partnerships
            </p>
          </div>
          <Button
            onClick={handleCreatePartner}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>

        {/* Filters */}
        <PartnerFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Results Summary */}
        {!isLoading && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalCount === 0
                ? 'No partners found'
                : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} partners`}
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading partners...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && partners.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No partners found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {Object.keys(filters).length > 0
                ? 'No partners match your current filters. Try adjusting your search criteria.'
                : 'Get started by adding your first business partner.'}
            </p>
            {Object.keys(filters).length > 0 ? (
              <Button variant="outline" onClick={() => handleFiltersChange({})}>
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={handleCreatePartner}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Partner
              </Button>
            )}
          </div>
        )}

        {/* Partners Grid */}
        {!isLoading && partners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onEdit={handleEditPartner}
                onDelete={handleDeletePartner}
                onView={handleViewPartner}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Delete Confirmation Loading */}
        {deletePartnerMutation.isPending && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-background border rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Deleting partner...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
