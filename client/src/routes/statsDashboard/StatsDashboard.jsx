import { useUser } from "@clerk/clerk-react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import "./stasDashboard.css";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import CompareIcon from "@mui/icons-material/Compare";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { InputAdornment } from "@mui/material";
import StatCard from "../../components/statCard/StatCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function StatsDashboard() {
  const { isSignedIn } = useUser();
  const [range, setRange] = useState("7days");
  const [customDate, setCustomDate] = useState(new Date());

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stats", { range, customDate }],
    enabled: isSignedIn,
    queryFn: async ({ queryKey }) => {
      const [_key, { range, customDate }] = queryKey;

      let dateObj;
      if (customDate instanceof Date) {
        dateObj = customDate;
      } else {
        dateObj = new Date(customDate); // phòng trường hợp customDate là string hoặc timestamp
      }

      let url = `${import.meta.env.VITE_API_URL}/api/stats?range=${range}`;

      // Xử lý các trường hợp range khác nhau
      if (["daily", "monthly", "yearly"].includes(range)) {
        url += `&date=${dateObj.toISOString().split("T")[0]}`; // Chỉ lấy ngày, không cần giờ
        url += `&month=${dateObj.getMonth() + 1}`; // Tháng trong JS bắt đầu từ 0
        url += `&year=${dateObj.getFullYear()}`; // Năm
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi fetch trạng thái");
      }

      return res.json();
    },
  });

  const chartData = {
    labels: stats?.dailyStats.map((d) => d.date) || [],
    datasets: [
      {
        label: "User",
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        data: stats?.dailyStats?.map((d) => d.userMessages),
      },
      {
        label: "Model",
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        data: stats?.dailyStats?.map((d) => d.botMessages),
      },
    ],
  };

  const interactionRate =
    stats?.totalUserMessages > 0
      ? parseFloat(
          (stats.totalBotMessages / stats.totalUserMessages).toFixed(2)
        )
      : 0;

  const totalSessionsStats = stats?.sessionsStats
    ? stats.sessionsStats.reduce((sum, item) => sum + item.sessions, 0)
    : 0;

  const avgBotPerSession =
    stats?.totalBotMessages > 0 && totalSessionsStats > 0
      ? parseFloat((stats.totalBotMessages / totalSessionsStats).toFixed(2))
      : 0;

  return (
    <div
      className="relative flex flex-col h-full overflow-auto stats-container"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-color)",
        padding: "16px",
      }}
    >
      <h2 className="text-xl font-semibold stats-title">📊 Bảng thống kê</h2>

      <div
        className="flex flex-wrap items-center gap-4"
        style={{ marginBottom: "24px" }}
      >
        <FormControl
          variant="outlined"
          size="medium"
          sx={{
            minWidth: 200,
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "4px",
            "& .MuiOutlinedInput-root": {
              color: "var(--text-color)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--divider-color)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--text-color)",
              },
            },
          }}
        >
          <InputLabel
            id="range-label"
            sx={{
              color: "var(--text-label-color)",
            }}
          >
            Thời gian
          </InputLabel>
          <Select
            labelId="range-label"
            value={range}
            label="Thời gian"
            onChange={(e) => setRange(e.target.value)}
            sx={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-color)",
              borderColor: "var(--divider-color)",
            }}
          >
            <MenuItem value="7days">7 ngày gần nhất</MenuItem>
            <MenuItem value="30days">30 ngày gần nhất</MenuItem>
            <MenuItem value="daily">Trong ngày</MenuItem>
            <MenuItem value="monthly">Theo tháng</MenuItem>
            <MenuItem value="yearly">Theo năm</MenuItem>
          </Select>
        </FormControl>

        {["daily", "monthly", "yearly"].includes(range) && (
          <TextField
            label="Chọn ngày"
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            size="medium"
            slotProps={{
              inputLabel: {
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarTodayOutlinedIcon
                      sx={{ color: "var(--text-label-color)" }}
                    />
                  </InputAdornment>
                ),
                shrink: true,
                style: { color: "var(--text-label-color)" },
              },
              htmlInput: { color: "var(--text-color)" },
            }}
            sx={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--divider-color)",
              minWidth: 200,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--divider-color)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& .MuiInputBase-input": {
                color: "var(--text-color)",
              },
              "& input::-webkit-calendar-picker-indicator": {
                filter: "var(--invert-icon)",
              },
            }}
          />
        )}

        {/* <Button
          onClick={() =>
            handleExportExcel(stats, interactionRate, avgBotPerSession)
          }
          variant="outlined"
          size="large"
          startIcon={<FileDownloadIcon />}
          sx={{
            backgroundColor: "var(--btn-bg)",
            color: "var(--text-color)",
            borderColor: "var(--divider-color)",
            "&:hover": {
              backgroundColor: "var(--btn-hover-bg)",
            },
          }}
        >
          Xuất Excel
        </Button> */}
      </div>
      {isLoading && <p>Đang tải thống kê...</p>}
      {isError && <p className="text-red-500">Lỗi: {error.message}</p>}
      {stats && (
        <div className="flex flex-wrap gap-6 mb-6">
          <StatCard
            icon={
              <PersonIcon
                sx={{ fontSize: "2rem", color: "var(--icon-stats-color)" }}
              />
            }
            value={stats.totalUserMessages}
            label="Tổng tin nhắn người dùng"
          />

          <StatCard
            icon={
              <SmartToyIcon
                sx={{ fontSize: "2rem", color: "var(--icon-stats-color)" }}
              />
            }
            value={stats.totalBotMessages}
            label="Tổng tin nhắn của Bot"
          />

          <StatCard
            icon={
              <ChatIcon
                sx={{ fontSize: "2rem", color: "var(--icon-stats-color)" }}
              />
            }
            value={totalSessionsStats}
            label="Tổng phiên trò chuyện"
          />

          <StatCard
            icon={
              <CompareIcon
                sx={{ fontSize: "2rem", color: "var(--icon-stats-color)" }}
              />
            }
            value={interactionRate}
            label="Tỷ lệ tương tác"
          />

          <StatCard
            icon={
              <ForumIcon
                sx={{ fontSize: "2rem", color: "var(--icon-stats-color)" }}
              />
            }
            value={avgBotPerSession}
            label="Tỷ lệ trả lời của bot / phiên"
          />

          <div className="w-full max-h-[400px]">
            <div className="rounded shadow">
              <h3
                className="mb-2 text-lg font-semibold"
                style={{
                  backgroundColor: "var(--bg-dashboard)",
                  color: "var(--text-color)",
                  boxShadow: "var(--box-shadow)",
                  padding: "16px",
                }}
              >
                Biểu đồ tin nhắn
              </h3>
              <Bar
                data={chartData}
                style={{
                  backgroundColor:
                    getComputedStyle(document.documentElement).getPropertyValue(
                      "--text-accent-bg"
                    ) || "#3b82f6",
                  padding: "16px",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsDashboard;
