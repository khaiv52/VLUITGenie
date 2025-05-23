import {
  FETCH_USERCHATS_REQUEST,
  FETCH_USERCHATS_FAILURE,
  FETCH_USERCHATS_SUCCESS,
} from "../actions/chatActions";

const initialState = {
  allChats: [],
  loading: false,
  error: null,
};

const userChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERCHATS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_USERCHATS_SUCCESS:
      return { ...state, loading: false, allChats: action.payload };
    case FETCH_USERCHATS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default userChatReducer