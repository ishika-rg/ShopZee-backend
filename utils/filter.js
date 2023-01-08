const filter = (queryString) => {
  const queryObj = { ...queryString };
  const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
  const fields = ["color", "price", "brand", "category"];
  excludedFields.forEach((el) => delete queryObj[el]);
  for (let key in queryObj) {
    if (!fields.includes(key)) {
      throw new Error(`The parameter ${key} is not supported for searching.`);
    }
  }
  let query = JSON.parse(
    JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    )
  );

  const answer = Object.keys(query)
    .filter((key) => key !== "price")
    .reduce((accumulator, key) => {
      return { ...accumulator, [key]: { $regex: query[key], $options: "i" } };
    }, {});

  return { ...query, ...answer };
};
export default filter;
