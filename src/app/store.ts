import { authReducer } from "@/features/auth/authSlice";
import { codeReducer } from "@/features/Code/codeSlice";
import { contestCodeReducer } from "@/features/Code/contestCodeSlice";
import { problemListReducer } from "@/features/ProblemList/problemListSlice";
import { contestListReducer } from "@/features/ContestList/contestListSlice";
import { submissionListReducer } from "@/features/SubmissionList/submissionListSlice";
import { tagsReducer } from "@/features/Tags/tagsSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { verificationReducer } from '../features/verification/verificationSlice';

function isJwtExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return !!(payload.exp && payload.exp * 1000 < Date.now());
  } catch {
    return true;
  }
}

const authPersistConfig = {
  key: "auth",
  storage,
  version: 1,
  migrate: async (state: any) => {
    if (!state) return state;
    // 在持久化恢复时校验 JWT，过期则清除登录态
    if (state.jwt && isJwtExpired(state.jwt)) {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        jwt: undefined,
        status: "idle",
        error: undefined,
      };
    }
    if (!state.user) return state;
    return {
      ...state,
      user: {
        ...state.user,
        role: state.user.role === "user" ? "student" : (state.user.role || "student"),
      },
    };
  },
  whitelist: ["user", "isAuthenticated", "jwt"],
};

const codePersistConfig = {
  key: "code",
  storage,
  whitelist: ["language", "fontsize", "codeFileObjectArray"],
};

const contestCodePersistConfig = {
  key: "contestCode",
  storage,
  whitelist: ["language", "fontsize", "codeFileObjectArray"],
};

const verificationPersistConfig = {
  key: "verification",
  storage,
  whitelist: ["verificationID","expireAt","nextSendAt"],
};

const obsoletePersistKeys = [
  "persist:tags",
  "persist:problemList",
  "persist:contestList",
  "persist:submissionList",
];

void Promise.all(obsoletePersistKeys.map((key) => storage.removeItem(key)));

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  code: persistReducer(codePersistConfig, codeReducer),
  contestCode: persistReducer(contestCodePersistConfig, contestCodeReducer),
  tags: tagsReducer,
  problemList: problemListReducer,
  contestList: contestListReducer,
  submissionList: submissionListReducer,
  verification: persistReducer(verificationPersistConfig, verificationReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // 我也不具体了解为什么这么做 做就对了 QAQ
});
export const persistor = persistStore(store);
// 注意一要改reducer部分 二要改 store 部分 增加一个新的persist store
export type RootState = ReturnType<typeof rootReducer>;
// 接受一个函数类型 返回这个函数的返回值类型 内置 类型相关用type 与 尖括号
export type AppDispatch = typeof store.dispatch;
// 想dispatch thunk 必须要有这一步
