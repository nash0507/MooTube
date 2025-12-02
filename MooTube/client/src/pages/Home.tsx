import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Mood, MoodEnum, MOOD_EMOJIS, MOOD_LABELS, saveMoodEntry } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSave = () => {
    if (!selectedMood) {
      toast({
        title: "請選擇一個心情",
        description: "告訴我你現在感覺如何吧！",
        variant: "destructive",
      });
      return;
    }

    const newEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      dateString: format(new Date(), "yyyy-MM-dd HH:mm"),
      mood: selectedMood,
      note: note.trim(),
    };

    saveMoodEntry(newEntry);

    toast({
      title: "紀錄成功！",
      description: "你的心情已經被保存下來了。",
    });

    setLocation("/history");
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 flex flex-col items-center max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-8"
      >
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground/90 tracking-tight">
            今天感覺如何？
          </h1>
          <p className="text-muted-foreground">停下來，深呼吸，記錄這一刻。</p>
        </header>

        <div className="flex justify-between items-center py-4">
          {MoodEnum.options.map((mood) => (
            <motion.button
              key={mood}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: selectedMood === mood ? 1.3 : 1,
                opacity: selectedMood && selectedMood !== mood ? 0.4 : 1,
              }}
              onClick={() => setSelectedMood(mood)}
              className="flex flex-col items-center gap-2 focus:outline-none"
            >
              <span className="text-4xl filter drop-shadow-md">
                {MOOD_EMOJIS[mood]}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {MOOD_LABELS[mood]}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-1">
            <Textarea
              placeholder="寫下一句簡短的想法..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-0 bg-transparent resize-none focus-visible:ring-0 min-h-[120px] placeholder:text-muted-foreground/50 text-lg p-4"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            記錄心情
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
