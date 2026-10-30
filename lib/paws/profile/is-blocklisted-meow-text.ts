const BLOCKED_WORDS = [
  "scream",
  "screams",
  "screaming",
  "shriek",
  "shrieking",
  "yell",
  "yelling",
  "cry",
  "crying",
  "sob",
  "sobbing",
  "gun",
  "guns",
  "gunshot",
  "gunshots",
  "gunfire",
  "shot",
  "shots",
  "shoot",
  "shooting",
  "bomb",
  "explosion",
  "explode",
  "kill",
  "killing",
  "murder",
  "stab",
  "stabbing",
  "blood",
  "bleeding",
  "torture",
  "suicide",
  "die",
  "dying",
  "death",
  "choke",
  "choking",
  "siren",
  "alarm",
  "sex",
  "sexy",
  "moan",
  "moaning",
  "orgasm",
  "porn",
  "nude",
  "naked",
  "cum",
  "say",
  "says",
  "saying",
  "speak",
  "speaking",
  "speech",
  "talk",
  "talking",
  "word",
  "words",
  "sing",
  "singing",
  "song",
  "music",
  "nazi",
  "hitler",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "kike",
  "chink",
  "spic",
];

const SPACED_OUT_WORDS = ["nigger", "faggot", "porn", "gunshot"];

const LOOKALIKES: { [character: string]: string | undefined } = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

/** Return `true` if `normalizedText` contains a word from the blocklist, after mapping digit and symbol lookalikes to letters; `false` otherwise. */
export function isBlocklistedMeowText(normalizedText: string) {
  const letters = Array.from(normalizedText)
    .map((character) => LOOKALIKES[character] ?? character)
    .join("");
  const words = letters.split(/[^a-z]+/).filter((word) => word !== "");
  const squashed = words.join("");
  return (
    words.some((word) => BLOCKED_WORDS.includes(word)) ||
    SPACED_OUT_WORDS.some((word) => squashed.includes(word))
  );
}
