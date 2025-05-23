import React, { useEffect, useState } from "react";
import "./dashboardPage.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import NorthIcon from '@mui/icons-material/North';
function DashboardPage() {
  const queryClient = useQueryClient();

  // Biến tăng dòng cho textarea
  const [rows, setRows] = useState(1);
  const [inputMessage, setInputMessage] = useState("");

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    // server response trả về id của chat mới tạo
    onSuccess: (id) => {
      console.log(id);

      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputMessage;
    if (!text) return;

    mutation.mutate(text); // Gọi hàm mutate với text

    const textarea = e.target;

    if (textarea) {
      textarea.style.height = "auto";
    }
  };

  // Xử lý sự kiện nhấn Enter
  const handleKeyDown = (event) => {
    const textarea = event.target;

    if (event.key === "Enter") {
      if (event.shiftKey) {
        event.preventDefault(); // Chặn hành vi mặc định để tránh xuống 2 dòng
        setInputMessage((prev) => prev + "\n"); // Nhấn shift thì Xuống dòng đúng 1 lần
        textarea.style.height = textarea.scrollHeight + "px"; // Tăng chiều cao khi nhấn enter cho text area
      } else {
        event.preventDefault(); // Chặn hành vi xuống dòng mặc định

        mutation.mutate(inputMessage);
        textarea.style.height = "auto"; // reset chiều cao
      }
    }
  };

  const handleChange = (event) => {
    setInputMessage(event.target.value);

    const lineBreaks = event.target.value.split("\n").length;
    setRows(Math.min(7, Math.max(1, lineBreaks))); // Giới hạn từ 1 đến 7 dòng
  };

  useEffect(() => {
    if (inputMessage.trim() === "") {
      setRows(1);
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "auto";
      }
    }
  }, [inputMessage]);

  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logoVLU.png" alt=""></img>
          <h1>VLUITGenie</h1>
        </div>
        {/* <div className="options">
          <div className="option">
            <img src="/chat.png" alt=""></img>
            <span>
              <Link to="/" className="dashBoardLink">
                Tạo hội thoại mới
              </Link>
            </span>
          </div>
          <div className="option">
            <img src="/image.png" alt=""></img>
            <span>Phân tích hình ảnh</span>
          </div>
        </div> */}
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <div className="area">
            <textarea
              type="text"
              name="text"
              placeholder="Hỏi bất kỳ điều gì..."
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              value={inputMessage}
              rows={rows}
            ></textarea>
          </div>
          {/* <input
            name="text"
            type="text"
            placeholder="Hỏi bất kỳ điều gì..."
          ></input> */}
          <button>
            <img src="/arrow.png" alt=""></img>
          </button>
        </form>
      </div>
    </div>
  );
}

export default DashboardPage;
