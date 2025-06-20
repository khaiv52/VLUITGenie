// Action Types
export const CHECK_AUTH_REQUEST = "CHECK_AUTH_REQUEST";
export const CHECK_AUTH_SUCCESS = "CHECK_AUTH_SUCCESS";
export const CHECK_AUTH_FAILURE = "CHECK_AUTH_FAILURE";

export const GET_GUEST_CHAT_COUNT_REQUEST = "GET_GUEST_CHAT_COUNT_REQUEST";
export const GET_GUEST_CHAT_COUNT_SUCCESS = "GET_GUEST_CHAT_COUNT_SUCCESS";
export const GET_GUEST_CHAT_COUNT_FAILURE = "GET_GUEST_CHAT_COUNT_FAILURE";

export const SET_CAME_FROM_CHAT = "SET_CAME_FROM_CHAT";

export const checkAuthStatus = () => async (dispatch) => {
  dispatch({ type: CHECK_AUTH_REQUEST });

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Not authenticated");

    const data = await res.json();

    dispatch({
      type: CHECK_AUTH_SUCCESS,
      payload: {
        isGuest: data.type === "guest",
        user: data.type === "authenticated" ? data : null,
        guestId: data.type === "guest" ? data.guestId : null,
      },
    });
  } catch (error) {
    dispatch({ type: CHECK_AUTH_FAILURE, payload: error.message });
  }
};


export const getGuestChatCount = (guestId) => async (dispatch) => {
  dispatch({ type: GET_GUEST_CHAT_COUNT_REQUEST });

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/guest/${guestId}/count`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch guest chat count");

    const data = await res.json();

    dispatch({
      type: GET_GUEST_CHAT_COUNT_SUCCESS,
      payload: data.userMessageCount,
    });
  } catch (error) {
    dispatch({
      type: GET_GUEST_CHAT_COUNT_FAILURE,
      payload: error.message,
    });
  }
};

export const setCameFromChat = (value) => ({
  type: SET_CAME_FROM_CHAT,
  payload: value,
});