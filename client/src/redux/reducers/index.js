import { combineReducers } from "@reduxjs/toolkit";
import drawerReducer from "./drawerReducer";
import dialogReducer from "./dialogReducer";
import userChatReducer from "./userChatReducer";

const rootReducer = combineReducers({
  drawer: drawerReducer,
  dialog: dialogReducer,
  userChat: userChatReducer,
  // Thêm reducer khác nếu có
});

export default rootReducer;
