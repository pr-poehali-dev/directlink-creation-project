export const generateUserId = () => {
  const words = ['ocean', 'star', 'moon', 'sky', 'sun', 'cloud', 'wave', 'wind', 'fire', 'earth'];
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${word1}-${num}-${word2}`;
};
