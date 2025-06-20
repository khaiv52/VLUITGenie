import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  checkAuthStatus,
  setCameFromChat,
} from "../../redux/actions/authActions";
import "./dashboardPage.css";
function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Biến tăng dòng cho textarea
  const [rows, setRows] = useState(1);
  const [inputMessage, setInputMessage] = useState("");
  const dispatch = useDispatch();

  const { isGuest } = useSelector((state) => state.auth); // Mặc định là guest vì trang HomePage tự động gọi API tạo guest

  // Xử lý nếu người dùng guest chọn đăng nhập khi đang ở trang chat
  useEffect(() => {
    if (isGuest) {
      // User chưa đăng nhập, đang ở trang chat => ghi nhớ flag
      dispatch(setCameFromChat(true));
    }
  }, [isGuest]);

  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = "auto"; // Reset trước
      element.style.height = element.scrollHeight + "px"; // Đặt chiều cao theo nội dung
    }
  };

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);
  // useEffect(() => {
  //   // Phương thức kiểm tra người dùng đã đăng nhập hay chưa (guest)
  //   fetch(`${import.meta.env.VITE_API_URL}/api/auth`, {
  //     method: "GET",
  //     credentials: "include",
  //   })
  //     .then((res) => {
  //       if (!res.ok) throw new Error("Not authenticated");
  //       return res.json();
  //     })
  //     .then((data) => {
  //       if (data.type == "authenticated") {
  //         console.log("Người dùng đã đăng nhập:", data);
  //         setIsGuest(false);
  //       } else if (data.type == "guest") {
  //         console.log("Người dùng guest:", data.guestId);
  //         setIsGuest(true);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("Chưa xác thực: ", err.message);
  //     });
  // });

  // Phương thức post cho guest
  const guestMutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/guest`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(
            error.message || "Lỗi khi gửi chat với tư cách guest."
          );
        }
        return res.json(); // Trả về ID chat
      });
    },
    onSuccess: (data) => {
      console.log(data.id);

      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${data.id}`);
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  // Phương thức post cho người dùng clerk
  const userMutation = useMutation({
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
      navigate(`/dashboard/chats/${id}`);
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputMessage;
    if (!text) return;

    if (isGuest) {
      guestMutation.mutate(text);
    } else {
      userMutation.mutate(text);
    }

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

        const text = inputMessage.trim();

        if (!text) return;

        if (isGuest) {
          guestMutation.mutate(inputMessage);
        } else {
          userMutation.mutate(inputMessage);
        }
        textarea.style.height = "auto"; // reset chiều cao
        setInputMessage("");
      }
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setInputMessage(value);

    const lineBreaks = value.split("\n").length;
    setRows(Math.min(7, Math.max(1, lineBreaks))); // Giới hạn từ 1 đến 7 dòng

    autoResizeTextarea(event.target);
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
              <Link to="/" className="dashboard-link">
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
          <button
            disabled={!inputMessage.trim()}
            type="submit"
            style={{ cursor: !inputMessage.trim() ? "not-allowed" : "pointer" }}
          >
            <img src="/arrow.png" alt=""></img>
          </button>
        </form>
      </div>
    </div>
  );
}

export default DashboardPage;
