const initialState = {
  openDialog: false,
};

const dialogReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_OPEN_DIALOG":
      return { ...state, openDialog: action.payload };
    default:
      return state;
  }
};

export default dialogReducer;
