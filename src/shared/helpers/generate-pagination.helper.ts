export const generatePagination = (page?: number, perPage?: number) => {
  const skip = !isNaN(page) && !isNaN(perPage) ? (page - 1) * perPage : undefined;
  const take = !isNaN(page) && !isNaN(perPage) ? perPage : undefined;
  return { skip, take };
};
