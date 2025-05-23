const isSameDay = (d1, d2) => {
  const date1 = d1 instanceof Date ? d1 : new Date(d1);
  const date2 = d2 instanceof Date ? d2 : new Date(d2);

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const now = new Date();
const today = new Date();
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);

export { isSameDay, now, today, yesterday };
