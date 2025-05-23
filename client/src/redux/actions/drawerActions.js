export const toggleDrawer = () => ({
  type: "TOGGLE_DRAWER",
});

export const setDrawer = (value) => ({
  type: "SET_DRAWER",
  payload: value,
});

// export const setIsTyping = (value) => ({
//   type: "SET_IS_TYPING",
//   payload: value,
// });

export const setOpenDialog = (value) => ({
  type: "SET_OPEN_DIALOG",
  payload: value,
});
