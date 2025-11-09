import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  const plans = {
    monthly: { price: 500, label: "Monthly", description: "PKR 500/month" },
    yearly: { price: 5000, label: "Yearly", description: "PKR 5,000/year (Save 17%)" }
  };

  const generateInvoice = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setInvoiceGenerated(true);
    
    toast({
      title: "Invoice Generated",
      description: `Please pay ${plans[plan].description} and upload payment screenshot.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentScreenshot || !selectedPlan || !user) return;

    setUploading(true);

    try {
      // Upload payment screenshot
      const fileExt = paymentScreenshot.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, paymentScreenshot);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      // Create subscription request
      const { error: insertError } = await supabase
        .from('subscription_requests')
        .insert({
          user_id: user.id,
          plan_type: selectedPlan,
          amount: plans[selectedPlan].price,
          payment_screenshot_url: publicUrl,
          notes: notes,
          invoice_number: `INV-${Date.now()}`,
        });

      if (insertError) throw insertError;

      toast({
        title: "Request Submitted",
        description: "Your subscription request has been submitted for verification. You'll be notified once approved.",
      });

      navigate("/settings");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Upgrade to Premium</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {!invoiceGenerated ? (
          <>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold">Choose Your Plan</h2>
              <p className="text-muted-foreground">Unlock all premium features</p>
            </div>

            <div className="grid gap-4">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => generateInvoice("monthly")}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Plan
                    <span className="text-2xl font-bold">PKR 500</span>
                  </CardTitle>
                  <CardDescription>Billed monthly</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Unlimited Receipt Scans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>AI Chat Assistant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Advanced Reports & Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Export to CSV/PDF</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-4">Generate Invoice</Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary hover:border-primary transition-colors cursor-pointer relative overflow-hidden" onClick={() => generateInvoice("yearly")}>
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                  Save 17%
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Yearly Plan
                    <span className="text-2xl font-bold">PKR 5,000</span>
                  </CardTitle>
                  <CardDescription>Billed annually</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Unlimited Receipt Scans</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>AI Chat Assistant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Advanced Reports & Analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span>Export to CSV/PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">Priority Support</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-4">Generate Invoice</Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Payment</CardTitle>
              <CardDescription>
                Please transfer {plans[selectedPlan!].description} to the account below and upload payment proof
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold">Bank Details:</p>
                  <p className="text-sm">Bank: [Your Bank Name]</p>
                  <p className="text-sm">Account: [Your Account Number]</p>
                  <p className="text-sm">Title: [Account Title]</p>
                  <p className="text-sm font-semibold text-primary">Amount: {plans[selectedPlan!].description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Upload Payment Screenshot *</Label>
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Transaction ID, reference number, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading || !paymentScreenshot}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Premium;
