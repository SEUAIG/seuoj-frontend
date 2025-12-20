import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import SearchInput from "../common/SearchInput";
import { SearchBar } from "../common/SearchBar";
import useDebounced from "@/hooks/useDebounced";
import UserTable from "../bussiness/UserTable";

export default function RankPage() {
  const [keyword, setKeyword] = useState("");
  const handleSearch = () => {
   
  };
  // 我在这里做了留白 等待后续选择是按钮搜索 还是 自动搜索 前者删去防抖 后者删去handlesearch
  const debouncedKeyword = useDebounced(keyword,300)
  return (
    <div className="w-4/5 mx-auto">
      <Helmet>
        <title>排名 - SeuOJ</title>
      </Helmet>
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onSearch={handleSearch}
      />
      <UserTable/>
    </div>
  );
}
