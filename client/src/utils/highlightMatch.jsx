export const highlightMatch = (text, query) => {
  if (!query) return text; // Nếu không có từ khóa, trả về văn bản gốc

  const regex = new RegExp(`(${query})`, "gi"); // Tạo regex với cờ 'gi' để tìm kiếm không phân biệt chữ hoa chữ thường
  const parts = text.split(regex); // Tách văn bản thành mảng các phần

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={index}
        style={{
          backgroundColor: "transparent",
          color: "#1976d2",
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};
