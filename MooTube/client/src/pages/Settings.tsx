import { useState, useEffect } from "react";
import { getStorageData, saveApiKey } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, ShieldCheck, ExternalLink } from "lucide-react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const data = getStorageData();
    if (data.geminiApiKey) {
      setApiKey(data.geminiApiKey);
    }
  }, []);

  const handleSave = () => {
    saveApiKey(apiKey);
    toast({
      title: "設定已儲存",
      description: "API Key 更新成功！",
    });
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground/90">系統設定</h1>
      </header>

      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Gemini API Key</h3>
              <p className="text-xs text-muted-foreground">用於啟用 AI 分析功能</p>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="輸入您的 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="glass-input rounded-xl h-12"
            />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <ShieldCheck className="w-3 h-3 inline mr-1 align-middle" />
              您的 Key 只會儲存在瀏覽器的 LocalStorage 中，不會傳送到任何第三方伺服器。
            </p>
          </div>

          <Button onClick={handleSave} className="w-full rounded-xl">
            儲存設定
          </Button>
        </div>

        <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">
          <p className="mb-2">如何獲取 Key？</p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            前往 Google AI Studio <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        
        <div className="text-center text-xs text-muted-foreground/50 pt-8">
          MoodFlow v1.0.0 <br/>
          Designed with ❤️
        </div>
      </div>
    </div>
  );
}
