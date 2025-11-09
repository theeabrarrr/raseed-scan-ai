import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [user]);

  const fetchReportsData = async () => {
    try {
      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      setSubscription(subData);

      // Fetch expenses
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', startOfMonth.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate category totals
      const categoryTotals: { [key: string]: number } = {};
      expenses?.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
      });

      const formattedCategories = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
      }));
      setCategoryData(formattedCategories);

      // Calculate weekly data
      const weeklyTotals: { [key: string]: number } = {};
      expenses?.forEach(exp => {
        const date = new Date(exp.date);
        const weekNum = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNum}`;
        weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + Number(exp.amount);
      });

      const formattedWeekly = Object.keys(weeklyTotals).map(week => ({
        week,
        amount: weeklyTotals[week]
      }));
      setWeeklyData(formattedWeekly);
    } catch (error) {
      console.error('Error fetching reports data:', error);
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
          <h1 className="text-2xl font-bold">Reports & Insights</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Premium Feature Banner - Only for Free Users */}
        {subscription?.plan_type === 'free' && (
          <Card className="shadow-card gradient-primary text-primary-foreground animate-fade-in">
            <CardContent className="pt-6 text-center">
              <Crown className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Unlock Premium Reports</h3>
              <p className="text-sm text-primary-foreground/90 mb-4">
                Get detailed insights, export data, and AI-powered recommendations
              </p>
              <Button 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => navigate("/premium")}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spending by Category</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              disabled={subscription?.plan_type !== 'premium'}
            >
              <Download className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No data available</p>
                <p className="text-sm mt-2">Start adding expenses to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Spending */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No data available</p>
                <p className="text-sm mt-2">Start adding expenses to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights - Locked for Free Users */}
        {subscription?.plan_type === 'free' && (
          <Card className="shadow-card opacity-60 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                AI Insights (Premium)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Get personalized spending recommendations and smart budgeting tips powered by AI
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
