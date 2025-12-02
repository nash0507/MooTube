import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStorageData, MoodEntry, MOOD_EMOJIS } from "@/lib/storage";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export default function History() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const data = getStorageData();
    // Sort by timestamp descending
    const sorted = [...data.moodEntries].sort((a, b) => b.timestamp - a.timestamp);
    setEntries(sorted);
  }, []);

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground/90">心情軌跡</h1>
      </header>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted-foreground space-y-4"
        >
          <div className="text-6xl opacity-20">📝</div>
          <p>還沒有紀錄，快去新增第一筆吧！</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-4 flex gap-4 items-start group"
            >
              <div className="text-4xl bg-white/50 w-14 h-14 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                {MOOD_EMOJIS[entry.mood]}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-bold text-primary/80">
                    {format(new Date(entry.timestamp), "MM月dd日 HH:mm", { locale: zhTW })}
                  </span>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed break-words">
                  {entry.note || <span className="text-muted-foreground italic">沒有備註</span>}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
