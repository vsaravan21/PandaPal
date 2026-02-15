/**
 * Simple whimsical response generator for the panda chat.
 * Replace with AI (e.g. OpenAI) later.
 */

const WHIMSICAL_REPLIES = [
  "Ooh, great question! I think the answer is: more snacks. Always more snacks. 🐼🥟",
  "Hmm, let me put on my thinking cap... *puts on cap* I'd say: try your best and have fun! ✨",
  "That's a good one! My panda pals say: be kind to yourself and take deep breaths. 🌸",
  "I love that you asked! Here's what I know: you're doing great just by trying. 🌟",
  "Ooh! Well, my favorite answer is: believe in yourself like I believe in bamboo. 🎋",
  "Great question! I think the best answer is: one step at a time, friend. You've got this! 🐼",
  "Hmm... *scratches head* I'd say: stay curious and keep asking questions! Just like you did! ✨",
  "That makes me think! Here's my two cents: you're braver than you know. 💚",
  "I don't have all the answers, but I know this: you're awesome for asking! 🐼✨",
  "Ooh, I like that! My answer: today is a good day to be kind—to yourself and others. 🌈",
];

/** Generate a friendly, whimsical reply to the child's message. */
export function generateWhimsicalResponse(_userMessage: string): string {
  const idx = Math.floor(Math.random() * WHIMSICAL_REPLIES.length);
  return WHIMSICAL_REPLIES[idx];
}
