import {api} from './api/axios'
export async function  search(keyword:string){
    if(!keyword.trim()) return [];
    // 如果关键词为空 返回一个空数组
    const res = await api.get("/api/search",{params:{q:keyword}})
    // params 是查询参数 自动将js对象转换为查询字符串 拼接到url上
    // 异步操作前一定要加上 await
    return await res.data.data;
    // 第一个data 标明是 对请求体的解析 第二个是请求体的data 注意有两个code 一个是网络的结果 一个是 api的结果
}