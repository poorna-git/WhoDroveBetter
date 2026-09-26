// Cheesy roasts shown when someone logs a drive without uploading a photo.
// Randomly chosen for maximum banter.

const NO_PHOTO_COMMENTS = [
  "Sure you drove it bro 😏",
  "Pics or it didn't happen 📸",
  "Trust me bro, source: trust me 🤥",
  "My uncle works at Ferrari too 🙄",
  "Cool story, needs more evidence 🧐",
  "Did you drive it or just sit in the passenger seat? 💺",
  "We'll just have to take your word for it... 🤷",
  "The court of WhoDroveBetter demands proof 👨‍⚖️",
  "Screenshot or it didn't happen 📱",
  "Bro logged a dream and called it a drive 💤",
  "Your imaginary friend drove it? 👻",
  "Real drivers carry receipts 🧾",
  "Driving it in Forza doesn't count 🎮",
  "Next you'll say you drove a spaceship 🚀",
  "Brave claim for someone with zero proof 🫡",
  "The audacity to log without a pic... legend 😤",
  "Even my grandma takes car selfies 👵📸",
  "No photo? That's suspicious 🔍",
  "Driven it in your mind doesn't count, my guy 🧠",
  "Alexa, show me someone who's capping 🧢",
];

/** Return a random roast for drives without a photo. */
export function getNoPhotoComment(): string {
  return NO_PHOTO_COMMENTS[Math.floor(Math.random() * NO_PHOTO_COMMENTS.length)];
}

/** Return a fun comment based on the car tier when logging. */
export function getTierComment(tier: string): string {
  switch (tier) {
    case "unicorn":
      return "🦄 NO WAY. Prove it.";
    case "exotic":
      return "🔥 Big flex incoming!";
    case "premium":
      return "😎 Now we're talking.";
    case "enthusiast":
      return "👊 A person of culture.";
    default:
      return "✅ Every car counts!";
  }
}
