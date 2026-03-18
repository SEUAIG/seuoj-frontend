import { api } from '@/services/api/axios'
import React from 'react'
async function getHeatMap(year: number)
{
    const res = await api.get("/api/me/heatmap", { params: { year } });
    return await res.data.data;
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
