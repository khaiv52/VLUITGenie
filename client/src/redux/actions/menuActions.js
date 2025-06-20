export const TOGGLE_MENU = "TOGGLE_MENU";
export const SET_MENU_OPEN = "SET_MENU_OPEN";

export const toggleMenu = () => ({
  type: TOGGLE_MENU,
});

export const setMenuOpen = (isOpen) => ({
  type: SET_MENU_OPEN,
  payload: isOpen,
});