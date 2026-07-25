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
