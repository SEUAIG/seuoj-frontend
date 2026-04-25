import { getMyHeatmap } from "@/services/user/getMyHeatmap";
import React from 'react'
async function getHeatMap(year: number)
{
    const res = await getMyHeatmap(String(year));
    return res.data;
}
function isLeapYear(year: number)
{
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
export default function HeatMap() {
    
  return (
    <div>
      
    </div>
  )
}
