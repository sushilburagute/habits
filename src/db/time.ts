export function localDayISO(d: Date): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
}
