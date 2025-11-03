import { formatInTimeZone } from 'date-fns-tz';

// Map locations to timezones
const locationToTimezone: Record<string, string> = {
  'Jakarta': 'Asia/Jakarta',
  'Yogyakarta': 'Asia/Jakarta',
  'Bandung': 'Asia/Jakarta',
  'Surabaya': 'Asia/Jakarta',
  // Add more locations as needed
};

export const formatDateByLocation = (date: Date, location: string): string => {
  const timezone = locationToTimezone[location] || 'Asia/Jakarta'; // Default to Jakarta
  return formatInTimeZone(date, timezone, 'MM/dd/yyyy, h:mm:ss a');
};