import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Scan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      processReceipt(base64);
    };
    reader.readAsDataURL(file);
  };

  const processReceipt = async (imageBase64: string) => {
    setIsScanning(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { imageBase64 },
      });

      if (error) throw error;

      toast.success("Receipt scanned successfully!");

      // Navigate to expense detail with extracted data
      navigate("/expense/new", {
        state: {
          merchant: data.merchant,
          amount: data.amount,
          date: data.date,
          category: data.category,
        },
      });
    } catch (error: any) {
      console.error('Error scanning receipt:', error);
      toast.error(error.message || "Failed to scan receipt");
      setIsScanning(false);
      setPreviewImage(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-2xl font-bold">Scan Receipt</h1>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Scanning View */}
        {previewImage && isScanning ? (
          <div className="space-y-6">
            <Card className="aspect-[3/4] overflow-hidden relative shadow-card">
              <img 
                src={previewImage} 
                alt="Receipt preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 text-primary-foreground animate-spin mb-4" />
                <p className="text-primary-foreground font-semibold text-lg">Scanning receipt...</p>
                <p className="text-primary-foreground/80 text-sm mt-2">Extracting details with AI</p>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            <Card 
              className="aspect-[3/4] border-2 border-dashed border-primary/30 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer shadow-card flex flex-col items-center justify-center p-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center space-y-6">
                <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Scan Your Receipt</h3>
                  <p className="text-muted-foreground text-sm">
                    Take a photo or upload an image of your receipt
                  </p>
                </div>

                {/* Frame Guide */}
                <div className="relative w-full max-w-[200px] aspect-[3/4] mx-auto">
                  <div className="absolute inset-0 border-2 border-primary/40 rounded-lg">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    size="lg" 
                    className="w-full gradient-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload from Gallery
                  </Button>
                </div>
              </div>
            </Card>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Tips */}
            <Card className="mt-6 p-6 shadow-card bg-secondary/30">
              <h4 className="font-semibold mb-3">Tips for best results:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ensure the receipt is well-lit and clearly visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Place the receipt flat on a surface</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Keep the camera steady and aligned</span>
                </li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Scan;
