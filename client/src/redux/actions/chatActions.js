// Action Types
export const FETCH_USERCHATS_REQUEST = "FETCH_USERCHATS_REQUEST";
export const FETCH_USERCHATS_SUCCESS = "FETCH_USERCHATS_SUCCESS";
export const FETCH_USERCHATS_FAILURE = "FETCH_USERCHATS_FAILURE";

// Action Creators
export const fetchChatsRequest = () => ({
  type: FETCH_USERCHATS_REQUEST,
});

export const fetchChatsSuccess = (chats) => ({
  type: FETCH_USERCHATS_SUCCESS,
  payload: chats,
});

export const fetchChatsFailure = (error) => ({
  type: FETCH_USERCHATS_FAILURE,
  payload: error,
});

// Async Action (Thunk)
export const getAllUserChats = () => async (dispatch) => {
  dispatch(fetchChatsRequest());
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
    });
    if(!res.ok) throw new Error ("Duyệt danh sách chat không thành công");
    const data = await res.json();
    dispatch(fetchChatsSuccess(data));
  } catch (error) {
    dispatch(fetchChatsFailure(error.message));
  }
};
