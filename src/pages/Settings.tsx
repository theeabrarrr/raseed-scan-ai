import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, User, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();

  const settingsItems = [
    { icon: User, label: "Profile Settings", onClick: () => {} },
    { icon: Bell, label: "Notifications", onClick: () => {} },
    { icon: Shield, label: "Privacy & Security", onClick: () => {} },
    { icon: HelpCircle, label: "Help & Support", onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Profile Card */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ahmad Khan</h3>
                <p className="text-sm text-muted-foreground">ahmad@example.com</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                <span className="font-medium">Free Plan</span>
              </div>
              <span className="text-sm text-muted-foreground">12/15 scans</span>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        <Card className="shadow-card gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              Upgrade to Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary-foreground">✓</span>
                <span>Unlimited receipt scans</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-foreground">✓</span>
                <span>Advanced reports & analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-foreground">✓</span>
                <span>AI-powered insights</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-foreground">✓</span>
                <span>Export to CSV/PDF</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card className="shadow-card">
          <CardContent className="p-2">
            {settingsItems.map((item, index) => (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-14 px-4 hover:bg-secondary"
                  onClick={item.onClick}
                >
                  <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{item.label}</span>
                </Button>
                {index < settingsItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;
