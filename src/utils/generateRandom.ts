// utils.ts
export const generateUniqueWalletId = (length: number): string => {
  const characters = '0123456789ABCDEFGHJKLMNPQRSTVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};
