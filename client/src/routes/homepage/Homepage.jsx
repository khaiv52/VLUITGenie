import React from "react";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import "./homepage.css";

function HomePage() {
  // Test Backend API
  // const test = async () => {
  //   await fetch("http://localhost:3000/api/test", {
  //     credentials: "include",
  //   });
  // };

  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital"></img>
      <div className="left">
        <h1>VLUITGenie</h1>
        <h2>
          Trợ lý AI tư vấn tuyển sinh - Thông minh, Chính xác, Cá nhân hóa
        </h2>
        <h3>
          VLUITGenie là Trợ lý AI tư vấn tuyển sinh của Trường Đại học Văn Lang,
          hỗ trợ thí sinh và phụ huynh tra cứu thông tin ngành học, điểm chuẩn,
          học bổng, học phí và cơ hội nghề nghiệp một cách nhanh chóng và chính
          xác.
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
      {/* <div className="footer">
        <p>@ 2025 | VLUITGenie Team</p>
        
      </div> */}
    </div>
  );
}

export default HomePage;
