const initialState = {
  open: false,
  isTyping: false,
};

const drawerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_DRAWER":
      return { ...state, open: !state.open };
    case "SET_DRAWER":
      return { ...state, open: action.payload };
    // case "SET_IS_TYPING":
    //   return { ...state, isTyping: action.payload };
    default:
      return state;
  }
};

export default drawerReducer;
