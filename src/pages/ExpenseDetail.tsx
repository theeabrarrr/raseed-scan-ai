import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  "Food",
  "Petrol",
  "Groceries",
  "Utilities",
  "Travel",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Other"
];

const ExpenseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isNew = id === "new";
  
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isNew && location.state) {
      const { merchant: m, amount: a, date: d } = location.state;
      setMerchant(m || "");
      setAmount(a?.toString() || "");
      setDate(d || "");
    }
  }, [isNew, location.state]);

  const handleSave = () => {
    if (!merchant || !amount || !date || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Expense saved successfully!");
    navigate("/expenses");
  };

  const handleDelete = () => {
    toast.success("Expense deleted");
    navigate("/expenses");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isNew ? "New Expense" : "Edit Expense"}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Form */}
        <Card className="p-6 shadow-card space-y-6">
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant / Store Name *</Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Savour Foods"
              className="bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PKR) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary/30">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              className="bg-secondary/30 min-h-[100px]"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full gradient-primary h-12 text-lg font-semibold"
            onClick={handleSave}
          >
            <Save className="mr-2 h-5 w-5" />
            Save Expense
          </Button>

          {!isNew && (
            <Button 
              variant="destructive"
              className="w-full h-12"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Expense
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
