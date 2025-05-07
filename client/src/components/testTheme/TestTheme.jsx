import React, { useEffect, useState } from "react";

function TestTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // khi theme thay đổi, cập nhật class và localStorage
  useEffect(() => {
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen text-white transition-all bg-black theme-light:bg-white-900 theme-light:text-black">
        <h1 className="mb-4 text-4xl font-bold">Chế độ giao diện</h1>
        <button
          onClick={toggleTheme}
          className="px-6 py-2 transition-all rounded theme-dark:text-white theme-dark:bg-gray-900 bg-white-800 theme-light:bg-white-900 theme-light:text-black"
        >
          Chuyển chế độ
        </button>
      </div>
    </div>
  );
}

export default TestTheme;
