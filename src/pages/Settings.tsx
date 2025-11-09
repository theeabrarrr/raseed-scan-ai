import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, User, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [profileRes, subRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', user!.id).eq('role', 'admin').single()
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (subRes.data) setSubscription(subRes.data);
      if (roleRes.data) setIsAdmin(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{profile?.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                <span className="font-medium">{subscription?.plan_type === 'premium' ? 'Premium' : 'Free'} Plan</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {subscription?.plan_type === 'free' && (
          <Card className="shadow-card gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6" />
                Upgrade to Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span>✓</span><span>Unlimited receipt scans</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>AI Chat Assistant</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Advanced reports</span></li>
                <li className="flex items-center gap-2"><span>✓</span><span>Export to CSV/PDF</span></li>
              </ul>
              <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={() => navigate("/premium")}>
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="shadow-card">
            <CardContent className="p-2">
              <Button variant="ghost" className="w-full justify-start h-14 px-4 hover:bg-secondary" onClick={() => navigate("/admin")}>
                <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>Admin Panel</span>
              </Button>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={signOut}>
          <LogOut className="h-5 w-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;
