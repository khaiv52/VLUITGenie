import { combineReducers } from "@reduxjs/toolkit";
import drawerReducer from "./drawerReducer";
import dialogReducer from "./dialogReducer";
import userChatReducer from "./userChatReducer";
import { authReducer } from "./authReducer";
import menuReducer from "./menuReducer";

const rootReducer = combineReducers({
  drawer: drawerReducer,
  dialog: dialogReducer,
  userChat: userChatReducer,
  auth: authReducer,
  menu: menuReducer,
  // Thêm reducer khác nếu có
});

export default rootReducer;
