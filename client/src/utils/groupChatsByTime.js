import { isSameDay } from "./dateFilters";

const now = new Date();
const today = new Date();
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);

export const groupChatsByTime = (chats) => {
  const groups = {
    "Hôm nay": [],
    "Hôm qua": [],
    "7 ngày trước": [],
    "30 ngày trước": [],
    months: {}, // Tháng cụ thể
    years: {}, // năm cũ
  };

  chats.forEach((chat) => {
    const created = new Date(chat.createdAt);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (isSameDay(created, today)) {
      groups["Hôm nay"].push(chat);
    } else if (isSameDay(created, yesterday)) {
      groups["Hôm qua"].push(chat);
    } else if (diffDays <= 7) {
      groups["7 ngày trước"].push(chat);
    } else if (diffDays <= 30) {
      groups["30 ngày trước"].push(chat);
    } else {
      const year = created.getFullYear();
      const month = created.toDateString("vi-VN", { month: "long" });
      const label = `${month} ${year}`;

      if (!groups.months[label]) {
        groups.months[label] = [];
      }
      groups.months[label].push(chat);

      // Ngoài ra gom theo năm
      if (!groups.years[year]) {
        groups.years[year] = [];
      }
      groups.years[year].push(chat);
    }
  });
  
  return groups;
};
