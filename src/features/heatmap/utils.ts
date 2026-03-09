import { HeatmapDay } from "@/types/heatmap";
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
export const getAllDatesOfYear = (year: string): string[] => {
  const y = parseInt(year, 10);
  const dates: string[] = [];
  const daysInMonth = [
    31,
    isLeapYear(y) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= daysInMonth[m]; d++) {
      const month = String(m + 1).padStart(2, "0");
      const day = String(d).padStart(2, "0");
      dates.push(`${y}-${month}-${day}`);
    }
  }
  return dates;
};
export const fillHeatmapDays = (
  year: string,
  rawDays: HeatmapDay[]
): HeatmapDay[] => {
  const allDates = getAllDatesOfYear(year);
  const rawMap = new Map<string, number>();
  if (rawDays) {
    rawDays.forEach((d) => {
      rawMap.set(d.date, d.count);
    });
  }
  return allDates.map((date) => ({
    date,
    count: rawMap.get(date) || 0,
  }));
};
export const groupDaysByWeek = (days: HeatmapDay[]): (HeatmapDay | null)[][] => {
  if (!days || days.length === 0) return [];
  const weeks: (HeatmapDay | null)[][] = [];
  const [y, m, d] = days[0].date.split('-').map(Number);
  const firstDate = new Date(y, m - 1, d); 
  const startDay = (firstDate.getDay() + 6) % 7;
  let currentWeek: (HeatmapDay | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }
  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]); 
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push([...currentWeek]);
  }
  return weeks;
};
export const getHeatmapColorClass = (count: number): string => {
  if (count === 0) return "bg-muted/30"; 
  if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900";
  if (count <= 5) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 10) return "bg-emerald-600 dark:bg-emerald-500";
  return "bg-emerald-800 dark:bg-emerald-300";
};
