import { createSlice } from "@reduxjs/toolkit";
interface ContestList {
  current: string;
  size: string;
  status: string | null;
  title_keyword: string | null;
  start_time: string | null;
  end_time: string | null;
  rule_type: string | null;
}
const initialState: ContestList = {
  current: "1",
  size: "20",
  status: null,
  title_keyword: null,
  start_time: null,
  end_time: null,
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
    setTitleKeyword(state, action) {
      state.title_keyword = action.payload;
    },
    setStartTime(state, action) {
      state.start_time = action.payload;
    },
    setEndTime(state, action) {
      state.end_time = action.payload;
    },
    setRuleType(state, action) {
      state.rule_type = action.payload;
    },
    clear(state) {
      state.status = null;
      state.title_keyword = null;
      state.start_time = null;
      state.end_time = null;
      state.rule_type = null;
    },
  },
});
export const {
  setCurrent,
  setSize,
  setStatus,
  setTitleKeyword,
  setStartTime,
  setEndTime,
  setRuleType,
  clear,
} = contestListSlice.actions;
export const contestListReducer = contestListSlice.reducer;
