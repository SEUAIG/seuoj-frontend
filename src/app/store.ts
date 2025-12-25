import authReducer from "@/features/auth/authSlice"
import {configureStore} from "@reduxjs/toolkit"
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
const authPersistConfig = {
  key: "auth", // storage 里的 key
  storage, 
  whitelist: ["user","isAuthenticated","jwt"], // 只持久化 auth里的
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
    // 我也不具体了解为什么这么做 做就对了 QAQ
});
export const persistor = persistStore(store);
// 注意一要改reducer部分 二要改 store 部分 增加一个新的persist store
export type RootState = ReturnType<typeof store.getState>
// 接受一个函数类型 返回这个函数的返回值类型 内置 类型相关用type 与 尖括号
export type AppDispatch = typeof store.dispatch;
// 想dispatch thunk 必须要有这一步