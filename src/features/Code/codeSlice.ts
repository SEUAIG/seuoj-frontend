import { createSlice } from "@reduxjs/toolkit";
interface CodeFileObject {
  pid: string;
  codeFile: string;
}
interface CodeSettingState {
  language: string;
  fontsize: number;
  codeFileObjectArray: CodeFileObject[];
}
// 每一个
const initialState: CodeSettingState = {
  language: "Cpp",
  fontsize: 12,
  codeFileObjectArray: [],
};
const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {
    setCodeFile(state, action) {
      const { pid, codeFile } = action.payload;
      const index = state.codeFileObjectArray.findIndex((i) => i.pid === pid);
      if (index !== -1) {
        state.codeFileObjectArray[index] = action.payload;
      } else {
        state.codeFileObjectArray.push(action.payload)
      }
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
    setFontsize(state, action) {
      state.fontsize = action.payload;
    },
  },
});
// 声明的是 reducer 导出的是action
export const { setCodeFile, setLanguage, setFontsize } = codeSlice.actions;
export const codeReducer = codeSlice.reducer;
// 只有一个不用解构
