import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const Expenses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-blue-500/10 text-blue-600",
      Petrol: "bg-orange-500/10 text-orange-600",
      Groceries: "bg-green-500/10 text-green-600",
      Utilities: "bg-purple-500/10 text-purple-600",
      Travel: "bg-pink-500/10 text-pink-600",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600";
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">All Expenses</h1>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Expenses List */}
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <Card className="p-8 text-center shadow-card">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {expenses.length === 0 ? "No expenses yet. Scan your first receipt!" : "No expenses found"}
              </p>
            </Card>
          ) : (
            filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                className="p-4 shadow-card hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 animate-fade-in"
                onClick={() => navigate(`/expense/${expense.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{expense.merchant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">PKR {Number(expense.amount).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
