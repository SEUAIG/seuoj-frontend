import { createSlice } from "@reduxjs/toolkit";
interface SubmissionListState {
  current: string;
  size: string;
}
const initialState: SubmissionListState = {
  current: "1",
  size: "10",
};
const submissionListSlice = createSlice({
  name: "submissionList",
  initialState,
  reducers: {
    setCurrent(state, action) {
      state.current = action.payload;
    },
    setSize(state, action) {
      state.size = action.payload;
    },
  },
});
export const { setCurrent, setSize } = submissionListSlice.actions;
export const submissionListReducer = submissionListSlice.reducer;
