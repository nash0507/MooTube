import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { getStorageData, MoodEntry, MOOD_COLORS, MOOD_LABELS } from "@/lib/storage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";

function Typewriter({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayedText}</span>;
}

export default function Stats() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const data = getStorageData();
    setEntries(data.moodEntries);
    setHasApiKey(!!data.geminiApiKey);
    calculateStreak(data.moodEntries);
  }, []);

  const calculateStreak = (data: MoodEntry[]) => {
    if (data.length === 0) return;
    const uniqueDays = new Set(
      data.map(e => new Date(e.timestamp).toDateString())
    );
    setStreak(uniqueDays.size); 
  };

  const getLast7DaysData = () => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return entries.filter(e => e.timestamp > sevenDaysAgo);
  };

  const chartData = (() => {
    const recent = getLast7DaysData();
    const counts: Record<string, number> = {};
    recent.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    
    return Object.entries(counts).map(([mood, count]) => ({
      name: MOOD_LABELS[mood as keyof typeof MOOD_LABELS],
      value: count,
      color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
    }));
  })();

  const getAIInsight = async () => {
    setLoading(true);
    setInsight(null);
    
    const { geminiApiKey } = getStorageData();
    if (!geminiApiKey) return;

    // 定義我們要嘗試的模型清單 (優先順序)
    const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    try {
      const recentEntries = getLast7DaysData().map(e => ({
        date: e.dateString,
        mood: e.mood,
        note: e.note
      }));
      
      const prompt = `Based on these mood entries: ${JSON.stringify(recentEntries)}, act as a warm, empathetic friend. Give a summary of my mental state and 1 actionable self-care tip in Traditional Chinese (繁體中文). Keep it under 100 words. Be gentle and supportive.`;

      let successText = null;
      let lastError = null;

      // 🔄 自動輪詢機制：一個一個試，直到成功
      for (const modelName of MODELS_TO_TRY) {
        try {
          console.log(`正在嘗試連接模型: ${modelName}...`);
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          successText = response.text();
          
          console.log(`✅ 成功連接模型: ${modelName}`);
          break; // 成功了就跳出迴圈
        } catch (err: any) {
          console.warn(`❌ 模型 ${modelName} 失敗:`, err.message);
          lastError = err;
          // 如果是 404 (找不到模型)，就繼續試下一個；如果是其他錯誤(如配額不足)，可能也要試下一個
        }
      }

      if (successText) {
        setInsight(successText);
      } else {
        // 如果全部都失敗，拋出最後一個錯誤
        throw lastError;
      }

    } catch (error: any) {
      console.error("Gemini Critical Error:", error);
      
      // 🕵️‍♂️ 進階偵錯：如果全部失敗，直接查詢這個 Key 到底能用什麼模型
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        console.log("正在嘗試列出所有可用模型以協助除錯...");
        try {
          const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
          const listData = await listResponse.json();
          console.log("📜 您的 API Key 可用的模型清單:", listData);
        } catch (fetchErr) {
          console.error("無法獲取模型清單", fetchErr);
        }
      }

      setInsight("抱歉，AI 連線失敗。請打開瀏覽器 Console (F12) 查看可用模型清單，或確認 API Key 權限。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 max-w-md mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground/90">情緒統計</h1>
      </header>

      {/* Streak Card */}
      <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">連續紀錄天數</p>
          <h3 className="text-3xl font-bold text-primary">{streak} <span className="text-base font-normal text-foreground/60">天</span></h3>
        </div>
        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-2xl">
          🔥
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel rounded-2xl p-6 min-h-[300px] flex flex-col">
        <h3 className="font-bold mb-4">近 7 天情緒分佈</h3>
        {chartData.length > 0 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            尚無足夠資料
          </div>
        )}
      </div>

      {/* AI Insight Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-foreground/80">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2>AI 智能分析</h2>
        </div>

        {!hasApiKey ? (
          <div className="glass-card rounded-xl p-6 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">需要設定 Gemini API Key 才能啟用此功能。</p>
            <Link href="/settings">
              <Button variant="outline" className="rounded-full">前往設定</Button>
            </Link>
          </div>
        ) : (
          <>
            {!insight && !loading && (
              <Button 
                onClick={getAIInsight} 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                獲得 AI 建議
              </Button>
            )}

            {loading && (
               <Button disabled className="w-full h-12 rounded-xl bg-primary/50 text-white">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                AI 正在思考 (嘗試連線中)...
              </Button>
            )}

            {insight && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-6 border-t-4 border-t-purple-400 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24" />
                </div>
                <h3 className="font-bold text-purple-600 mb-2">你的專屬建議</h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line min-h-[100px]">
                  <Typewriter text={insight} />
                </p>
                <Button 
                  onClick={getAIInsight} 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-xs text-muted-foreground hover:text-primary"
                >
                  重新分析
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
