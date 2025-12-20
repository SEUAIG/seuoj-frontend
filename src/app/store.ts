import authReducer from "@/features/auth/authSlice"
import {configureStore} from "@reduxjs/toolkit"
export const store = configureStore({
    reducer:{
        auth:authReducer,
    }
})
export type RootState = ReturnType<typeof store.getState>
// 接受一个函数类型 返回这个函数的返回值类型 内置 类型相关用type 与 尖括号
export type AppDispatch = typeof store.dispatch;
// 想dispatch thunk 必须要有这一步