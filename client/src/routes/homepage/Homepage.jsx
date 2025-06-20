import React from "react";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import "./homepage.css";
import { useEffect } from "react";
import Footer from "../../components/footer/Footer";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { checkAuthStatus } from "../../redux/actions/authActions";

function HomePage() {
  // Test Backend API
  // const test = async () => {
  //   await fetch("http://localhost:3000/api/test", {
  //     credentials: "include",
  //   });
  // };

  // Tạo guestId nếu chưa đăng nhập (người dùng guest)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/guest/init`, {
      method: "GET",
      credentials: "include", // Để cookie guestId được lưu lại
    });
  }, []);

  // Kiêm tra nếu đã đăng nhập thì gọi hàm checkAuth để xóa guestId cookies
  const { isSignedIn } = useAuth();
  const dispatch = useDispatch();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (isSignedIn) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isSignedIn]);

  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital"></img>
      <div className="home-content">
        <div className="left">
          <h1>VLUITGenie</h1>
          <h2>
            Trợ lý AI tư vấn tuyển sinh - Thông minh, Chính xác, Cá nhân hóa
          </h2>
          <h3>
            VLUITGenie là Trợ lý AI tư vấn tuyển sinh của Trường Đại học Văn
            Lang, hỗ trợ thí sinh và phụ huynh tra cứu thông tin ngành học, điểm
            chuẩn, học bổng, học phí và cơ hội nghề nghiệp một cách nhanh chóng
            và chính xác.
          </h3>
          <Link to="/dashboard/chats">Bắt đầu chat</Link>
          {/* <button onClick={test}>BACKEND TEST</button> */}
        </div>
        <div className="right">
          <div className="imgContainer">
            <div className="bgContainer">
              <div className="bg"></div>
            </div>
            <img src="/robot.png" className="bot"></img>
            <div className="chat">
              <img src="/robot.png" alt=""></img>
              <TypeAnimation
                sequence={[
                  "Bạn cần tư vấn ngành học?",
                  1000,
                  "Bạn muốn tìm hiểu về học phí và học bổng?",
                  1000,
                  "Bạn cần thông tin về chương trình đào tạo?",
                  1000,
                  "Bạn quan tâm đến ký túc xá và đời sống sinh viên?",
                  1000,
                  "Bạn muốn biết thêm thông tin về giảng viên của khoa?",
                  1000,
                  "Bạn cần tìm hiểu cơ hội việc làm sau khi tốt nghiệp?",
                  1000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
                style={{ color: "white" }}
                omitDeletionAnimation={true}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <p>@ 2025 | VLUITGenie Team</p> */}
      <div className="footer">
        <Footer />
        <div className="flex items-center justify-center bg-[var(--bg-footer-tail)] w-full h-[40px]">
          @2025 | VLUITGenie Team
        </div>
      </div>
    </div>
  );
}

export default HomePage;
