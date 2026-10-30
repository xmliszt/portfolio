export const AGES = ["kitten", "adult", "old"] as const;
export const VOICES = ["squeaky", "soft", "raspy", "deep"] as const;
export const MOODS = ["chatty", "sleepy", "grumpy"] as const;

export type Age = (typeof AGES)[number];
export type Voice = (typeof VOICES)[number];
export type Mood = (typeof MOODS)[number];

export type VoiceSettings = { age: Age; voice: Voice; mood: Mood };
