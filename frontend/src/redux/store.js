import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "./authSlice";
import postSlice from "./postSlice.js";
import chatSlice from "./chatSlice.js";
import rtnSlice from "./rtnSlice.js";
import socketSlice from "./socketSlice.js";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ['socketio'], // Don't persist socket.io instance
};

const rootReducer = combineReducers({
  auth: authReducer,
  post: postSlice,
  chat: chatSlice,
  rtn: rtnSlice,
  socketio: socketSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['socketio.socket'], // Ignore socket.io object - it's not serializable
      },
    }),
});
export default store;