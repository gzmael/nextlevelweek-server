export default function converHourToMinute(time: string): number {
  const [hour, minutes] = time.split(':').map(Number);
  return hour * 60 + minutes;
}
