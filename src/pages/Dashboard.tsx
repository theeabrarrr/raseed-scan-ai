import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [topCategory, setTopCategory] = useState("N/A");
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch expenses for current month
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Calculate total spend
      const total = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      setTotalSpend(total);
      setTotalReceipts(expenses?.length || 0);

      // Find top category
      const categoryTotals: { [key: string]: number } = {};
      expenses?.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
      });
      const topCat = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b, "N/A"
      );
      setTopCategory(topCat);

      // Set recent expenses
      setRecentExpenses(expenses?.slice(0, 3) || []);

      // Generate spending data for chart
      const chartData: { [key: string]: number } = {};
      expenses?.forEach(exp => {
        const day = new Date(exp.date).getDate().toString();
        chartData[day] = (chartData[day] || 0) + Number(exp.amount);
      });
      
      const formatted = Object.keys(chartData)
        .sort((a, b) => Number(a) - Number(b))
        .map(day => ({ date: day, amount: chartData[day] }));
      
      setSpendingData(formatted.length > 0 ? formatted : [{ date: "1", amount: 0 }]);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
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
      <div className="bg-gradient-primary px-6 pt-8 pb-16 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-primary-foreground/80">Here's your spending overview</p>
      </div>

      <div className="px-6 -mt-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card transition-all hover:shadow-lg hover:-translate-y-1 transition-slow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {totalSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-all hover:shadow-lg hover:-translate-y-1 transition-slow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receipts Scanned</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReceipts}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="shadow-card transition-all hover:shadow-lg hover:-translate-y-1 transition-slow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCategory}</div>
              <p className="text-xs text-muted-foreground mt-1">Most spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Spending Chart */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
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
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/expenses")}
              className="text-primary hover:text-primary"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-fast cursor-pointer"
                    onClick={() => navigate(`/expense/${expense.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.merchant}</p>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">PKR {Number(expense.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No expenses yet</p>
                <p className="text-sm">Scan your first receipt to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg gradient-primary hover:shadow-xl hover:scale-110 transition-slow"
          onClick={() => navigate("/scan")}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
