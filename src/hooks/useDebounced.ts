import { useEffect, useState } from "react";

// 该hook为input 防抖使用 初始默认300ms
export default function useDebounced<T>(value:T,delay=300){
    const [debounced,setDebounced] = useState(value)
    useEffect(()=>{
        const timer = setTimeout(()=>{
            setDebounced(value)
        },delay);
        return ()=>clearTimeout(timer)
    },[value,delay])
    return debounced;
}