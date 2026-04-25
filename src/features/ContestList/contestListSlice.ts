import { createSlice } from "@reduxjs/toolkit";
interface ContestList {
  current: string;
  size: string;
  status: string | null;
  title: string | null;
  rule_type: string | null;
}
const initialState: ContestList = {
  current: "1",
  size: "20",
  status: null,
  title: null,
  rule_type: null,
};
const contestListSlice = createSlice({
  name: "contestList",
  initialState,
  reducers: {
    setCurrent(state, action) {
      state.current = action.payload;
    },
    setSize(state, action) {
      state.size = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    setRuleType(state, action) {
      state.rule_type = action.payload;
    },
    clear(state) {
      state.status = null;
      state.title = null;
      state.rule_type = null;
    },
  },
});
export const {
  setCurrent,
  setSize,
  setStatus,
  setTitle,
  setRuleType,
  clear,
} = contestListSlice.actions;
export const contestListReducer = contestListSlice.reducer;
