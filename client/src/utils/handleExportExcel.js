import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const handleExportExcel = (data, interactionRate, avgBotPerSession) => {
  if (!data || !data.dailyStats) return;

  // Phần 1: Dữ liệu thống kê theo ngày
  const dailyStatsData = data.dailyStats.map((entry) => ({
    Ngày: entry.date,
    "Tin nhắn của người dùng": entry.userMessages,
    "Tin nhắn của Bot": entry.botMessages,
  }));

  // Thêm 2 dòng trống để ngăn cách
  dailyStatsData.push({}, {});

  // Dòng "TỔNG KẾT" ở cột đầu, 2 cột sau trống
  dailyStatsData.push({
    Ngày: "TỔNG KẾT",
    "Tin nhắn của người dùng": "",
    "Tin nhắn của Bot": "",
  });

  // Header cho phần tổng kết
  dailyStatsData.push({
    Ngày: "Nội dung",
    "Tin nhắn của người dùng": "Giá trị",
    "Tin nhắn của Bot": "",
  });

  // Các dòng dữ liệu tổng kết
  dailyStatsData.push(
    {
      Ngày: "Tổng số phiên trò chuyện",
      "Tin nhắn của người dùng": data.totalSessions,
      "Tin nhắn của Bot": "",
    },
    {
      Ngày: "Tổng tin nhắn của người dùng",
      "Tin nhắn của người dùng": data.totalUserMessages,
      "Tin nhắn của Bot": "",
    },
    {
      Ngày: "Tổng tin nhắn của Bot",
      "Tin nhắn của người dùng": data.totalBotMessages,
      "Tin nhắn của Bot": "",
    },
    {
      Ngày: "Tỷ lệ tương tác (Bot/User)",
      "Tin nhắn của người dùng": interactionRate,
      "Tin nhắn của Bot": "",
    },
    {
      Ngày: "Trung bình tin nhắn (Bot/phiên)",
      "Tin nhắn của người dùng": avgBotPerSession,
      "Tin nhắn của Bot": "",
    }
  );

  const worksheet = XLSX.utils.json_to_sheet(dailyStatsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Thống kê");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(file, `stats-${new Date().toISOString().split("T")[0]}.xlsx`);
};
