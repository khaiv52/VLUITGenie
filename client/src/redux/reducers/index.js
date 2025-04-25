import { combineReducers } from "@reduxjs/toolkit";
import drawerReducer from "./drawerReducer";

const rootReducer = combineReducers({
  drawer: drawerReducer,
  // Thêm reducer khác nếu có
});

export default rootReducer;
