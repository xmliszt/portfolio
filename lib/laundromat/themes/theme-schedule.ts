export type ThemeSchedule = {
  id: string;
  themeId: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  timeZone: string;
  priority: number;
};
