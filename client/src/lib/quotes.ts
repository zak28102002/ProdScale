const dailyQuotes = [
  "Discipline is remembering what you want.",
  "Success is the sum of small efforts repeated day in day out.",
  "The way to get started is to quit talking and begin doing.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future belongs to those who believe in their dreams.",
  "Excellence is never an accident. It is always the result of high intention.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Believe it. Build it.",
  "Your only limit is your mind.",
  "Sometimes later becomes never. Do it now.",
  "A year from now you may wish you had started today.",
  "If you want something you've never had, you must be willing to do something you've never done.",
  "Success is what happens after you have survived all your disappointments.",
  "Don't be afraid to give up the good to go for the great.",
  "The difference between ordinary and extraordinary is that little extra.",
  "You are never too old to set another goal or to dream a new dream.",
  "Believe you can and you're halfway there."
];

export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
