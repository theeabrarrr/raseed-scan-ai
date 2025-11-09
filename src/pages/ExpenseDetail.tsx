import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Healthcare", "Other"];

const ExpenseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const isNew = id === "new";
  
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNew && location.state) {
      const { merchant: m, amount: a, date: d, category: c } = location.state;
      setMerchant(m || "");
      setAmount(a?.toString() || "");
      setDate(d || new Date().toISOString().split('T')[0]);
      setCategory(c || "");
    } else if (!isNew && id) {
      fetchExpense();
    }
  }, [isNew, id]);

  const fetchExpense = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMerchant(data.merchant);
      setAmount(data.amount.toString());
      setDate(data.date);
      setCategory(data.category);
      setNotes(data.notes || "");
    } catch (error: any) {
      toast.error("Failed to load expense");
      navigate("/expenses");
    }
  };

  const handleSave = async () => {
    if (!merchant || !amount || !date || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        const { error } = await supabase.from('expenses').insert({
          user_id: user!.id,
          merchant,
          amount: parseFloat(amount),
          date,
          category,
          notes,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenses').update({
          merchant,
          amount: parseFloat(amount),
          date,
          category,
          notes,
        }).eq('id', id);
        if (error) throw error;
      }
      toast.success("Expense saved successfully!");
      navigate("/expenses");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast.success("Expense deleted");
      navigate("/expenses");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-gradient-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "New Expense" : "Edit Expense"}</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card className="p-6 shadow-card space-y-6">
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant / Store Name *</Label>
            <Input id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Savour Foods" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PKR) *</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any additional details..." rows={4} />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Expense
          </Button>
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
