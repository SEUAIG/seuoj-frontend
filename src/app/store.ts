import { authReducer } from "@/features/auth/authSlice";
import { codeReducer } from "@/features/Code/codeSlice";
import { contestCodeReducer } from "@/features/Code/contestCodeSlice";
import { problemListReducer } from "@/features/ProblemList/problemListSlice";
import { contestListReducer } from "@/features/ContestList/contestListSlice";
import { submissionListReducer } from "@/features/SubmissionList/submissionListSlice";
import { tagsReducer } from "@/features/Tags/tagsSlice";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { verificationReducer } from '../features/verification/verificationSlice';
const authPersistConfig = {
  key: "auth", // storage 里的 key
  storage,
  whitelist: ["user", "isAuthenticated", "jwt"], // 只持久化 auth里的
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
const tagsPersistConfig = {
  key: "tags",
  storage,
  whitelist: [],
};
const problemListPersistConfig = {
  key: "problemList",
  storage,
  whitelist: [],
};
const contestListPersistConfig = {
  key: "contestList",
  storage,
  whitelist: [],
};
const submissionListPersistConfig = {
  key: "submissionList",
  storage,
  whitelist: [],
};
const verificationPersistConfig = {
  key: "verification",
  storage,
  whitelist: ["verificationID","expireAt","nextSendAt"],
};
// TODO 退出登录时应当清除code auth的持久化
export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    code: persistReducer(codePersistConfig, codeReducer),
    contestCode: persistReducer(contestCodePersistConfig, contestCodeReducer),
    tags: persistReducer(tagsPersistConfig, tagsReducer),
    problemList:persistReducer(problemListPersistConfig,problemListReducer),
    contestList: persistReducer(contestListPersistConfig, contestListReducer),
    submissionList: persistReducer(
      submissionListPersistConfig,
      submissionListReducer
    ),
    verification:persistReducer(verificationPersistConfig,verificationReducer)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // 我也不具体了解为什么这么做 做就对了 QAQ
});
export const persistor = persistStore(store);
// 注意一要改reducer部分 二要改 store 部分 增加一个新的persist store
export type RootState = ReturnType<typeof store.getState>;
// 接受一个函数类型 返回这个函数的返回值类型 内置 类型相关用type 与 尖括号
export type AppDispatch = typeof store.dispatch;
// 想dispatch thunk 必须要有这一步
