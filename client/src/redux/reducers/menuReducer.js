import { SET_MENU_OPEN, TOGGLE_MENU } from "../actions/menuActions";

const initialState = {
  menuOpen: true, // mặc định mở
};

const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_MENU:
      return { ...state, menuOpen: !state.menuOpen };
    case SET_MENU_OPEN:
      return { ...state, menuOpen: action.payload };
    default:
      return state;
  }
};

export default menuReducer;