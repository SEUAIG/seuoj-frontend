import { Tag } from "@/components/bussiness/TagSelector";
import { createSlice } from "@reduxjs/toolkit";

// 第一步 初始状态确定
interface Tags {
  tags: Tag[];
}
const initialState: Tags = {
  tags: [],
};
// 第二步 创建对应切片 名称 初始状态 reducers
const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    addTag(state, action) {
      const tag = action.payload;
      const tags = state.tags;
      const isIn = tags.some((item, index) => item.tag_id === tag.tag_id);
      if (isIn) return;
      state.tags.push(tag);
    },
    deleteTag(state, action) {
      const tag = action.payload;
      const tags = state.tags;
      const isInIndex = tags.findIndex(
        (item, index) => item.tag_id === tag.tag_id
      );
      if (isInIndex === -1) return;
      state.tags.splice(isInIndex, 1);
    },
    clearTags(state){
        state.tags=[]
    }
  },
});
// 第三步 导出对应actions 与 reducer 只有一个不用解构
export const { addTag, deleteTag,clearTags } = tagsSlice.actions;
export const tagsReducer = tagsSlice.reducer;
