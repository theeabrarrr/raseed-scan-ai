import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubscriptionRequest {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  payment_screenshot_url: string;
  status: string;
  invoice_number: string;
  notes: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchRequests();
  }, [user]);

  const checkAdminAndFetchRequests = async () => {
    if (!user) return;

    try {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);

      // Fetch subscription requests
      const { data, error } = await supabase
        .from('subscription_requests')
        .select(`
          *,
          profiles!subscription_requests_user_id_fkey (email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, userId: string, planType: string) => {
    setProcessingId(requestId);
    try {
      // Update subscription request status
      const { error: updateError } = await supabase
        .from('subscription_requests')
        .update({
          status: 'approved',
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Update user subscription
      const expiresAt = planType === 'monthly' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'premium',
          billing_cycle: planType,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', userId);

      if (subError) throw subError;

      toast({
        title: "Request Approved",
        description: "Subscription has been activated successfully.",
      });

      checkAdminAndFetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('subscription_requests')
        .update({
          status: 'rejected',
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "The subscription request has been rejected.",
      });

      checkAdminAndFetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Admin Panel</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {request.profiles?.full_name || "User"}
                    </CardTitle>
                    <CardDescription>{request.profiles?.email}</CardDescription>
                  </div>
                  <Badge variant={
                    request.status === 'pending' ? 'secondary' :
                    request.status === 'approved' ? 'default' : 'destructive'
                  }>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium capitalize">{request.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">PKR {request.amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice</p>
                    <p className="font-medium">{request.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{request.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(request.payment_screenshot_url)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Screenshot
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id, request.user_id, request.plan_type)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No subscription requests found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>Verify the payment details</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Payment screenshot"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
