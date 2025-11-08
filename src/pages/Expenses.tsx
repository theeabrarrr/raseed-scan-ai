import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockExpenses = [
  { id: 1, merchant: "Savour Foods", amount: 1500, category: "Food", date: "2024-01-15" },
  { id: 2, merchant: "PSO Petrol Pump", amount: 3500, category: "Petrol", date: "2024-01-14" },
  { id: 3, merchant: "Al-Fatah", amount: 2800, category: "Groceries", date: "2024-01-13" },
  { id: 4, merchant: "Metro Cash & Carry", amount: 5200, category: "Groceries", date: "2024-01-12" },
  { id: 5, merchant: "KFC", amount: 2100, category: "Food", date: "2024-01-11" },
  { id: 6, merchant: "Utility Bills", amount: 4500, category: "Utilities", date: "2024-01-10" },
  { id: 7, merchant: "Shell Petrol", amount: 3800, category: "Petrol", date: "2024-01-09" },
  { id: 8, merchant: "McDonald's", amount: 1800, category: "Food", date: "2024-01-08" },
];

const Expenses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExpenses = mockExpenses.filter(expense =>
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
              <p className="text-muted-foreground">No expenses found</p>
            </Card>
          ) : (
            filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                className="p-4 shadow-card hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
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
                        <span className="text-xs text-muted-foreground">{expense.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">PKR {expense.amount.toLocaleString()}</p>
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
