import { useEffect } from "react";
// 该hook废弃 我们使用helmet进行head信息的设置
export default function useSetWebTitle(title:string){
    useEffect(()=>{
        // 我们可以在useEffect中操作dom元素 浏览器会提供一些全局对象 如window document （注意它不算是一个特定标签而是总管对象 之间有重复的）
        document.title = `${title}`;
    })
}