import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Check, Star, Zap } from 'lucide-react';
import { usePayments, CreditPackage } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';

const supabase = getSupabase();

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    creditPackages,
    createRazorpayOrder,
    processPaymentSuccess,
    isProcessingPayment,
    setIsProcessingPayment,
  } = usePayments();

  const { user, activeClinic } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [, setIsRazorpayLoaded] = useState(false);

  // Fetch user profile data to get phone number
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => {
        toast.error('Failed to load payment gateway');
      };
      document.body.appendChild(script);
    };

    if (open) {
      loadRazorpay();
    }
  }, [open]);

  const handlePurchase = async (creditPackage: CreditPackage) => {
    setIsProcessingPayment(true);
    setSelectedPackage(creditPackage);

    try {
      const { transaction, order } = await createRazorpayOrder.mutateAsync({
        packageId: creditPackage.id,
        amount: creditPackage.amount,
        credits: creditPackage.credits,
      });

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Doxxy Healthcare',
        description: `${creditPackage.name} - ${creditPackage.credits} appointment credits`,
        image: 'https://doxxy.neurovisionhospital.com/logo.svg', // Use absolute HTTPS URL instead of relative path
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            await processPaymentSuccess.mutateAsync({
              transactionId: transaction.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              credits: creditPackage.credits,
            });
            
            toast.success('Payment successful!', {
              description: `${creditPackage.credits} credits have been added to your account.`,
            });
            
            onOpenChange(false);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed', {
              description: 'Please contact support if the amount was deducted.',
            });
          }
        },
        prefill: {
          name: userProfile?.name || user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: userProfile?.phone || '',
        },
        notes: {
          clinic_id: activeClinic?.clinic_id || '',
          package_id: creditPackage.id,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setSelectedPackage(null);
            // Restore our modal when Razorpay is dismissed
            onOpenChange(true);
            toast('Payment cancelled', {
              description: 'You can try again anytime.',
            });
          },
        },
      };

      // Hide our modal temporarily to avoid z-index conflicts
      onOpenChange(false);
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error: unknown) {
      console.error('Order creation error:', error);
      
      // Check if this is a setup error
      if (error instanceof Error && 'response' in error) {
        const errorResponse = error as { response?: { data?: { setup_required?: boolean } } };
        if (errorResponse.response?.data?.setup_required) {
          toast.error('Razorpay setup required', {
            description: 'Please configure Razorpay credentials in Supabase Dashboard to enable payments.',
          });
        } else {
          toast.error('Order creation failed', {
            description: 'Please try again or contact support.',
          });
        }
      } else {
        toast.error('Order creation failed', {
          description: 'Please try again or contact support.',
        });
      }
      
      setIsProcessingPayment(false);
      setSelectedPackage(null);
    }
  };

  const PackageCard: React.FC<{ package: CreditPackage }> = ({ package: pkg }) => (
    <Card className={cn(
      'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
      pkg.popular && 'ring-2 ring-blue-500 ring-offset-2',
      selectedPackage?.id === pkg.id && 'ring-2 ring-blue-500'
    )}>
      {pkg.popular && (
        <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
          <Star className="w-3 h-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-semibold">{pkg.name}</CardTitle>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-blue-600">₹{pkg.amount}</div>
          <div className="text-sm text-muted-foreground">{pkg.description}</div>
          {pkg.savings && (
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              {pkg.savings}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Credits</span>
            <span className="font-semibold">{pkg.credits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Per appointment</span>
            <span className="font-semibold">₹{(pkg.amount / pkg.credits).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center text-sm text-green-600">
              <Check className="w-4 h-4 mr-2" />
              No expiry
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Check className="w-4 h-4 mr-2" />
              All payment methods
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Check className="w-4 h-4 mr-2" />
              Instant activation
            </div>
          </div>
        </div>
        
        <Button
          className="w-full mt-6"
          onClick={() => handlePurchase(pkg)}
          disabled={isProcessingPayment}
          variant={pkg.popular ? 'default' : 'outline'}
        >
          {isProcessingPayment && selectedPackage?.id === pkg.id ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Purchase Credits
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Purchase Appointment Credits
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose a credit package to continue booking appointments
          </DialogDescription>
        </DialogHeader>


        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Secure payment via Razorpay
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Instant credit activation
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              No hidden charges
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-4">
          By purchasing credits, you agree to our terms of service. 
          Credits are non-refundable and have no expiry date.
        </div>
      </DialogContent>
    </Dialog>
  );
}; 