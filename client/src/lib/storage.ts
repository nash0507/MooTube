import { z } from "zod";

export const MoodEnum = z.enum(["happy", "neutral", "sad", "angry", "anxious"]);
export type Mood = z.infer<typeof MoodEnum>;

export interface MoodEntry {
  id: string;
  timestamp: number;
  dateString: string;
  mood: Mood;
  note: string;
}

export interface StorageData {
  moodEntries: MoodEntry[];
  geminiApiKey: string | null;
}

const STORAGE_KEY = "moodflow_data_v1";

export const getStorageData = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { moodEntries: [], geminiApiKey: null };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return { moodEntries: [], geminiApiKey: null };
  }
};

export const saveMoodEntry = (entry: MoodEntry) => {
  const data = getStorageData();
  const updatedData = {
    ...data,
    moodEntries: [entry, ...data.moodEntries],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

export const saveApiKey = (key: string) => {
  const data = getStorageData();
  const updatedData = {
    ...data,
    geminiApiKey: key,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  happy: "😄",
  neutral: "😐",
  sad: "😞",
  angry: "😡",
  anxious: "😰",
};

export const MOOD_LABELS: Record<Mood, string> = {
  happy: "開心",
  neutral: "平靜",
  sad: "難過",
  angry: "生氣",
  anxious: "焦慮",
};

export const MOOD_COLORS: Record<Mood, string> = {
  happy: "#FCD34D", // Yellow
  neutral: "#9CA3AF", // Gray
  sad: "#60A5FA", // Blue
  angry: "#F87171", // Red
  anxious: "#A78BFA", // Purple
};
