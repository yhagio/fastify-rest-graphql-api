export const isMoreThanXHours = (dateStr: Date, x: number): boolean => {
  const now: any = new Date();
  const comparingDate: any = dateStr;

  return Math.abs(now - comparingDate) / 36e5 > x;
};