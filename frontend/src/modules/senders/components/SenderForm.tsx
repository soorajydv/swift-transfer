import { Sender } from '@/shared/types';
import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { ArrowLeft, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { useSenders } from '@/modules/senders/hooks/useSenders';
import SendersService from '@/modules/senders/services/senders.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Alert, AlertDescription } from '@/shared/components/alert';

type SenderFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  identityType: 'passport' | 'residence_card' | 'drivers_license';
  identityNumber: string;
  status: 'active' | 'inactive' | 'pending_verification';
};

const initialFormData: SenderFormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  identityType: 'residence_card',
  identityNumber: '',
  status: 'pending_verification',
};

export function SenderForm({
  editingSender,
  onClose,
  onSuccess
}: {
  editingSender?: Sender;
  onClose?: () => void;
  onSuccess?: () => void;
} = {}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { createSender, updateSender } = useSenders();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SenderFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEditingSender, setCurrentEditingSender] = useState<Sender | undefined>(editingSender);

  const isEdit = Boolean(editingSender || id);

  // Fetch individual sender for editing when ID is present
  useEffect(() => {
    const fetchSender = async () => {
      if (id && !editingSender) {
        setIsLoading(true);
        try {
          const response = await SendersService.getById(id);
          if (response.success && response.data) {
            setCurrentEditingSender(response.data);
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Error loading sender';
          setError(errorMessage);
          toast({ title: errorMessage, variant: 'destructive' });
        }
        setIsLoading(false);
      }
    };

    fetchSender();
  }, [id, editingSender, toast]);

  useEffect(() => {
    if (isEdit && currentEditingSender) {
      setFormData({
        fullName: currentEditingSender.fullName,
        email: currentEditingSender.email,
        phone: currentEditingSender.phone,
        address: currentEditingSender.address,
        city: currentEditingSender.city,
        identityType: currentEditingSender.identityType,
        identityNumber: currentEditingSender.identityNumber,
        status: currentEditingSender.status,
      });
    }
  }, [isEdit, currentEditingSender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user?.id) {
      const errorMessage = 'You must be logged in to create a sender';
      setError(errorMessage);
      toast({ title: errorMessage, variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && currentEditingSender) {
        await updateSender(currentEditingSender.id, formData);
        toast({ title: 'Sender updated successfully' });
      } else {
        await createSender({
          ...formData,
          country: 'Japan',
        } as any);
        toast({ title: 'Sender created successfully' });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/senders');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error saving sender';
      setError(errorMessage);
      toast({ title: errorMessage, variant: 'destructive' });
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/senders');
    }
  };

  return (
    <div className="animate-fade-in">
      {!onClose && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Senders
          </Button>

          <PageHeader
            title={isEdit ? 'Edit Sender' : 'Register New Sender'}
            description={isEdit ? 'Update sender information' : 'Register a new sender from Japan'}
          />
        </div>
      )}

      {onClose && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Sender' : 'Register New Sender'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Update sender information' : 'Register a new sender from Japan'}
          </p>
        </div>
      )}

      <div className={`bg-card rounded-xl border border-border p-6 ${onClose ? '' : ''}`}>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1 hover:bg-destructive/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Takeshi Yamamoto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="takeshi@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+81-90-1234-5678"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="1-2-3 Shibuya"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Tokyo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityType">ID Type *</Label>
              <Select
                value={formData.identityType}
                onValueChange={(value: SenderFormData['identityType']) =>
                  setFormData({ ...formData, identityType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residence_card">Residence Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identityNumber">ID Number *</Label>
              <Input
                id="identityNumber"
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                placeholder="RC123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: SenderFormData['status']) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="btn-gradient">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                'Update Sender'
              ) : (
                'Register Sender'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
