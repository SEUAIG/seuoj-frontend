import { createSlice } from "@reduxjs/toolkit";

interface ProblemList {
  current: string;
  size: string;
  title: string | null;
  tag_ids: number[] | null;
}
const initialState: ProblemList = {
  current: "1",
  size: "10",
  title: null,
  tag_ids: null,
};
const problemListSlice = createSlice({
  name: "problemList",
  initialState,
  reducers: {
    setCurrent(state,action){
        state.current = action.payload;
        // payload 支持任何类型 只要你给定就可以
    },
    setSize(state,action){
        state.size = action.payload;
    },
    setTitle(state,action){
        state.title=action.payload;
    },
    setTagIds(state,action){
        state.tag_ids = action.payload;
    },
    clear(state){
        state.title=null;
        state.tag_ids=null;
    }
    
  },
});
// 传入一个配置对象
export const {setSize,setTitle,setTagIds,clear,setCurrent} = problemListSlice.actions;
export const problemListReducer = problemListSlice.reducer;