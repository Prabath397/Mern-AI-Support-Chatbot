export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function friendlyError(error) {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong."
  );
}
