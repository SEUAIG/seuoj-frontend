import { sendRegisterCode } from "@/services/auth";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Verification {
  verificationID: string | null;
  sendStatus: "idle" | "loading" | "success" | "error";
  verifyStatus: "idle" | "loading" | "success" | "error";
  expireAt: number | null;
  nextSendAt: number | null;
  error: string;
}
const initialState: Verification = {
  verificationID: null,
  sendStatus: "idle",
  expireAt: null,
  nextSendAt: null,
  verifyStatus: "idle",
  error: "",
};
interface SendCodeParams {
  email: string;
}

interface SendCodeResponse {
  code: number;
  message: string;
  data: {
    expire_in: number;
    next_send_in: number;
    verification_id: string;
  };
}
export const getVerificationCodeBythunk = createAsyncThunk<
  SendCodeResponse["data"],
  SendCodeParams,
  { rejectValue: string }
>("verification", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await sendRegisterCode({ email });
    return res.data;
  } catch (err: unknown) {
    const maybeError =
      typeof err === "object" && err !== null && "response" in err
        ? (err as { response?: { data?: { message?: string } } })
        : undefined;
    const errorMsg = maybeError?.response?.data?.message || "发送失败";
    return rejectWithValue(errorMsg);
  }
});
const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    resetVerification(state, action) {
      state.verificationID = null;
      state.sendStatus = "idle";
      state.verifyStatus = "idle";
      state.expireAt = null;
      state.nextSendAt = null;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVerificationCodeBythunk.pending, (state, action) => {
        state.sendStatus = "loading";
        state.error = "";
      })
      .addCase(getVerificationCodeBythunk.fulfilled, (state, action) => {
        state.sendStatus = "success";
        const { expire_in, next_send_in, verification_id } = action.payload;
        const now = Date.now();
        const expiretime = now + Number(expire_in) * 1000;
        state.expireAt = expiretime;
        const nextsendtime = now + next_send_in * 1000;
        state.nextSendAt = nextsendtime;
        state.verificationID = verification_id;
      })
      .addCase(getVerificationCodeBythunk.rejected, (state, action) => {
        state.sendStatus = "error";
        state.error = (action.payload as string) || "验证码发送失败";
      });
  },
});
export const { resetVerification } = verificationSlice.actions;
// 导出的时是动作 整个切片导出的才是Slice 的reducer
export const verificationReducer = verificationSlice.reducer;
