const getDataRange = (range, customDate) => {
  const today = new Date();
  let startDate, endDate;

  if (range === "7days") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    endDate = today;
  } else if (range === "30days") {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    endDate = today;
  } else if (range === "daily") {
    startDate = new Date(customDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customDate);
    endDate.setHours(23, 59, 59, 999);
  } else if (range === "monthly") {
    const year = customDate.getFullYear();
    const month = customDate.getMonth();
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  } else if (range === "yearly") {
    const year = customDate.getFullYear();
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  }

  if (!startDate || !endDate) {
    throw new Error(`Invalid range: ${range}`);
  }

  return { startDate, endDate };
};

module.exports = { getDataRange };
