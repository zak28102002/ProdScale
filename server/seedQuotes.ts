import { db } from "./db";
import { quotes } from "@shared/schema";

const motivationalQuotes = [
  { text: "Dream bigger. Do bigger.", author: null },
  { text: "Discipline is remembering what you want.", author: null },
  { text: "Success is the sum of small efforts repeated day in day out.", author: "Robert Collier" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future belongs to those who believe in their dreams.", author: "Eleanor Roosevelt" },
  { text: "Excellence is never an accident. It is always the result of high intention.", author: "Aristotle" },
  { text: "Your limitation—it's only your imagination.", author: null },
  { text: "Push yourself, because no one else is going to do it for you.", author: null },
  { text: "Great things never come from comfort zones.", author: null },
  { text: "Dream it. Wish it. Do it.", author: null },
  { text: "Success doesn't just find you. You have to go out and get it.", author: null },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: null },
  { text: "Don't stop when you're tired. Stop when you're done.", author: null },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: null },
  { text: "Do something today that your future self will thank you for.", author: null },
  { text: "Little things make big days.", author: null },
  { text: "It's going to be hard, but hard does not mean impossible.", author: null },
  { text: "Don't wait for opportunity. Create it.", author: null },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: null },
  { text: "The key to success is to focus on goals, not obstacles.", author: null },
  { text: "Dream it. Believe it. Build it.", author: null },
  { text: "Your only limit is your mind.", author: null },
  { text: "Sometimes later becomes never. Do it now.", author: null },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "If you want something you've never had, you must be willing to do something you've never done.", author: "Thomas Jefferson" },
  { text: "Success is what happens after you have survived all your disappointments.", author: null },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: null },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't be distracted by criticism. Remember—the only taste of success some people get is to take a bite out of you.", author: "Zig Ziglar" },
  { text: "Success seems to be connected with action. Successful people keep moving.", author: "Conrad Hilton" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.", author: "Jim Rohn" },
  { text: "I cannot give you the formula for success, but I can give you the formula for failure—try to please everybody.", author: "Herbert Bayard Swope" },
  { text: "Would you like me to give you a formula for success? It's quite simple, really: Double your rate of failure.", author: "Thomas J. Watson" },
  { text: "People who succeed have momentum. The more they succeed, the more they want to succeed.", author: "Tony Robbins" },
  { text: "You've got to get up every morning with determination if you're going to go to bed with satisfaction.", author: "George Lorimer" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "It is better to fail in originality than to succeed in imitation.", author: "Herman Melville" },
  { text: "A goal is not always meant to be reached; it often serves simply as something to aim at.", author: "Bruce Lee" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
  { text: "Too many of us are not living our dreams because we are living our fears.", author: "Les Brown" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
  { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "I have learned over the years that when one's mind is made up, this diminishes fear.", author: "Rosa Parks" },
  { text: "I alone cannot change the world, but I can cast a stone across the water to create many ripples.", author: "Mother Teresa" },
  { text: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
  { text: "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.", author: "Henry Ford" },
  { text: "It's not whether you get knocked down; it's whether you get up.", author: "Vince Lombardi" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles Swindoll" },
  { text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "Mark Twain" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "We become what we think about.", author: "Earl Nightingale" },
  { text: "Life isn't about getting and having, it's about giving and being.", author: "Kevin Kruse" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing—that's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "If you're offered a seat on a rocket ship, don't ask what seat! Just get on.", author: "Sheryl Sandberg" },
  { text: "The battles that count aren't the ones for gold medals. The struggles within yourself—the invisible battles inside all of us—that's where it's at.", author: "Jesse Owens" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. Being willing is not enough; we must do.", author: "Leonardo da Vinci" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "If you do what you've always done, you'll get what you've always gotten.", author: "Tony Robbins" },
  { text: "Remember that not getting what you want is sometimes a wonderful stroke of luck.", author: "Dalai Lama" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "When I was 5 years old, my mother always told me that happiness was the key to life. When I went to school, they asked me what I wanted to be when I grew up. I wrote down 'happy'. They told me I didn't understand the assignment, and I told them they didn't understand life.", author: "John Lennon" },
  { text: "The person who says it cannot be done should not interrupt the person who is doing it.", author: "Chinese Proverb" },
  { text: "You become what you believe.", author: "Oprah Winfrey" }
];

export async function seedQuotes() {
  try {
    console.log("Seeding quotes...");
    
    // Insert all quotes
    for (const quote of motivationalQuotes) {
      await db.insert(quotes).values({
        text: quote.text,
        author: quote.author,
        category: "motivation"
      });
    }
    
    console.log(`Successfully seeded ${motivationalQuotes.length} quotes`);
  } catch (error) {
    console.error("Error seeding quotes:", error);
    throw error;
  }
}

// Run if called directly
seedQuotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });