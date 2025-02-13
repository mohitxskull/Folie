import dayjs from "dayjs";

export const formatDate = (
  date: string | Date | null,
  format: string = "DD MMM YYYY HH:mm A",
) => {
  if (!date) return null;

  return dayjs(date).format(format);
};

export const parseDate = (date: string | null) => {
  if (!date) return null;

  return new Date(date);
};

export const stringifyDate = (date: Date | null) => {
  if (!date) return null;

  return date.toISOString();
};
