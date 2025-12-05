// File: components/payments/CreditPurchaseModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Star, Zap, IndianRupee, Loader2 } from 'lucide-react';
import { usePayments, CreditPackage } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Type Definitions ---
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
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
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

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // 1. Load Razorpay Script dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => toast.error('Failed to load payment gateway');
    document.body.appendChild(script);
  }, []);

  // 2. Pre-select popular package ONLY when modal opens
  // FIXED: Removed 'selectedPackage' from dependency array to prevent auto-reselection 
  // when user clears package to type custom amount.
  useEffect(() => {
    if (open && creditPackages.length > 0) {
      setCustomAmount(''); // Reset custom amount on open
      const popular = creditPackages.find(p => p.popular) || creditPackages[0];
      setSelectedPackage(popular);
    }
  }, [open, creditPackages]);

  const handlePurchase = async () => {
    if (!activeClinic) return;
    setIsProcessingPayment(true);

    let amount = 0;
    let credits = 0;
    let packageId = 'custom';
    let description = '';

    // Logic to determine amount/credits
    if (selectedPackage) {
      amount = selectedPackage.amount;
      credits = selectedPackage.credits;
      packageId = selectedPackage.id;
      description = selectedPackage.name;
    } else {
      const rawAmount = parseInt(customAmount);
      if (isNaN(rawAmount) || rawAmount < 100) {
        toast.error("Invalid amount", { description: "Minimum purchase is ₹100" });
        setIsProcessingPayment(false);
        return;
      }
      amount = rawAmount;
      credits = Math.floor(rawAmount / 10); // ₹10 per credit for custom
      description = `Custom Amount (${credits} credits)`;
    }

    try {
      // Step A: Create Order via Edge Function
      const { transaction, order } = await createRazorpayOrder.mutateAsync({
        packageId,
        amount,
        credits
      });

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) throw new Error("Razorpay key missing");

      // Step B: Open Razorpay Modal
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: activeClinic.clinic_name || 'Clinic Credits',
        description: description,
        order_id: order.id,
        handler: async (response) => {
          try {
            await processPaymentSuccess.mutateAsync({
              transactionId: transaction.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            onOpenChange(false); // Close modal on success
          } catch (e) {
            console.error(e);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setIsProcessingPayment(false);
      // Toast is handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Purchase Appointment Credits
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Select a package to continue using the platform.
          </DialogDescription>
        </DialogHeader>

        {/* Package Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg);
                setCustomAmount(''); // Clear custom amount if selecting a package
              }}
              className={cn(
                'relative cursor-pointer transition-all border-2 hover:shadow-md',
                selectedPackage?.id === pkg.id 
                  ? 'border-blue-600 bg-blue-50/50' 
                  : 'border-transparent hover:border-gray-200'
              )}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2 pt-6">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="text-2xl font-bold text-blue-700">₹{pkg.amount}</div>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="font-semibold text-gray-900">{pkg.credits} Credits</div>
                <div className="text-xs text-muted-foreground">
                  ₹{Math.round(pkg.amount / pkg.credits)} / appointment
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-green-700 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" /> No Expiry
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Amount Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase text-muted-foreground">Or Custom Amount</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-2">
              <Label>Enter Amount (Min ₹100)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-9"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    // CRITICAL: Deselect package so button logic switches to custom amount
                    setSelectedPackage(null); 
                  }}
                />
              </div>
              {customAmount && !isNaN(parseInt(customAmount)) && (
                <p className="text-xs text-muted-foreground text-right">
                  Will convert to <strong>{Math.floor(parseInt(customAmount) / 10)}</strong> credits
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Button
            className="w-full h-12 text-lg font-medium"
            disabled={isProcessingPayment || !isRazorpayLoaded || (!selectedPackage && !customAmount)}
            onClick={handlePurchase}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Secure Payment...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2 fill-current" />
                Pay ₹{selectedPackage ? selectedPackage.amount : customAmount || '0'}
              </>
            )}
          </Button>
          {!isRazorpayLoaded && (
            <p className="text-xs text-center text-red-500 mt-2">Loading payment gateway...</p>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};