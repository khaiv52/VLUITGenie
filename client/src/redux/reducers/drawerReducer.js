const initialState = {
  open: false,
};

const drawerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_DRAWER":
      return { ...state, open: !state.open };
    case "SET_DRAWER":
      return { ...state, open: action.payload };
    default:
      return state;
  }
};

export default drawerReducer;
