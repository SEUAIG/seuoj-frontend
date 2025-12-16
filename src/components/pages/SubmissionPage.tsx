import React from "react";
import SubmissionRecord from "../bussiness/SubmissionRecord";
import CodeShow from "../common/CodeShow";
import TestPoints from "../bussiness/TestPoints";
// 参考http://eoj.seucpc.com/submission/63869
export default function SubmissionPage() {
  return (
    <div className="flex flex-col pb-6 p-2 mx-auto w-4/5">
      <SubmissionRecord />
      <CodeShow>{`#include <iostream>
using namespace std;

int main() {
    int a, b;
    // 读取输入的两个整数
    cin >> a >> b;
    // 输出它们的和
    cout << a + b << endl;
    return 0;
}`}</CodeShow>
      <TestPoints />
    </div>
  );
}
