const removeVietnameseTones = (str) => {
    return str.normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d").replace(/Đ/g, "D") // thay đ
    .toLowerCase();
}

module.exports = removeVietnameseTones