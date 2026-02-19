import { createSlice } from "@reduxjs/toolkit";

interface ContestCodeFileObject {
  contest_id: string;
  pid: string;
  codeFile: string;
}

interface ContestCodeSettingState {
  language: string;
  fontsize: number;
  codeFileObjectArray: ContestCodeFileObject[];
}

const initialState: ContestCodeSettingState = {
  language: "Cpp",
  fontsize: 12,
  codeFileObjectArray: [],
};

const contestCodeSlice = createSlice({
  name: "contestCode",
  initialState,
  reducers: {
    setContestCodeFile(state, action) {
      const { contest_id, pid, codeFile } = action.payload;
      const index = state.codeFileObjectArray.findIndex(
        (i) => i.contest_id === contest_id && i.pid === pid
      );
      if (index !== -1) {
        state.codeFileObjectArray[index] = action.payload;
      } else {
        state.codeFileObjectArray.push(action.payload);
      }
    },
    setContestLanguage(state, action) {
      state.language = action.payload;
    },
    setContestFontsize(state, action) {
      state.fontsize = action.payload;
    },
  },
});

export const { setContestCodeFile, setContestLanguage, setContestFontsize } =
  contestCodeSlice.actions;
export const contestCodeReducer = contestCodeSlice.reducer;
