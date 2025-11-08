import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const categoryData = [
  { name: "Food", value: 8500, color: "#3b82f6" },
  { name: "Petrol", value: 7300, color: "#f97316" },
  { name: "Groceries", value: 8000, color: "#10b981" },
  { name: "Utilities", value: 4500, color: "#8b5cf6" },
];

const weeklyData = [
  { week: "Week 1", amount: 6200 },
  { week: "Week 2", amount: 8100 },
  { week: "Week 3", amount: 5900 },
  { week: "Week 4", amount: 8300 },
];

const Reports = () => {
  const navigate = useNavigate();

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
        {/* Premium Feature Banner */}
        <Card className="shadow-card gradient-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <Crown className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Unlock Premium Reports</h3>
            <p className="text-sm text-primary-foreground/90 mb-4">
              Get detailed insights, export data, and AI-powered recommendations
            </p>
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spending by Category</CardTitle>
            <Button variant="ghost" size="icon" disabled>
              <Download className="h-5 w-5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Spending */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Locked Features */}
        <Card className="shadow-card opacity-60">
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
      </div>
    </div>
  );
};

export default Reports;
