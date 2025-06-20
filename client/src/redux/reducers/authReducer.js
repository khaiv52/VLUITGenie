import {
  CHECK_AUTH_FAILURE,
  CHECK_AUTH_REQUEST,
  CHECK_AUTH_SUCCESS,
  GET_GUEST_CHAT_COUNT_FAILURE,
  GET_GUEST_CHAT_COUNT_REQUEST,
  GET_GUEST_CHAT_COUNT_SUCCESS,
  SET_CAME_FROM_CHAT,
} from "../actions/authActions";

const initialState = {
  loading: false,
  isGuest: true,
  user: null,
  guestId: null,
  error: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHECK_AUTH_REQUEST:
      return { ...state, loading: true, error: null };
    case CHECK_AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        isGuest: action.payload.isGuest,
        user: action.payload.user,
        guestId: action.payload.guestId,
      };
    case CHECK_AUTH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GET_GUEST_CHAT_COUNT_REQUEST:
      return {
        ...state,
        loadingGuestChatCount: true,
        guestChatCountError: null,
      };
    case GET_GUEST_CHAT_COUNT_SUCCESS:
      return {
        ...state,
        loadingGuestChatCount: false,
        guestChatCount: action.payload,
      };
    case GET_GUEST_CHAT_COUNT_FAILURE:
      return {
        ...state,
        loadingGuestChatCount: false,
        guestChatCountError: action.payload,
      };
    case SET_CAME_FROM_CHAT:
      return {
        ...state,
        cameFromChat: action.payload,
      };
    default:
      return state;
  }
};
