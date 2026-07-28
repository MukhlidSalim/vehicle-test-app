/**
 * Format a Date object as DD-MM-YYYY string.
 * @param date - The Date object to format.
 * @returns Formatted date string.
 */
export const formatDateDDMMYYYY = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

/**
 * Format a YYYY-MM-DD string as DD-MM-YYYY string.
 */
export const formatStringDDMMYYYY = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};
