import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import filter from "../utils/filter.js";

// @desc Fetch all the products
// @route GET/api/products
// @access public
export const getProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit);
  const page = Number(req.query.page) || 1;
  const filterObj = filter(req.query);
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Product.count({ ...filterObj, ...keyword });
  const products = await Product.find({ ...filterObj, ...keyword })
    .sort(req.query.sort)
    .limit(limit)
    .skip(limit * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / limit) });
});

// @desc Fetch all the products
// @route GET/api/products/:id
// @access public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc delete product by id
// @route DELETE/api/product/:id
// @access private/admin
export const deleteProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: "product successfully deleted" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc create product
// @route POST/api/products
// @access private/admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: "/images/sample.jpg",
    category: ["Sample category"],
    color: "white",
    brand: "sample brand",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc update product by id
// @route PUT/api/products/:id
// @access private/admin
export const updateProductById = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc update product by id
// @route POST/api/products/:id/reviews
// @access private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReview) {
      res.status(400);
      throw new Error("Produvt already reviewed!");
    }
    const review = {
      name: req.user.name,
      rating,
      comment,
      user: req.user._id,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, i) => acc + i.rating, 0) /
      product.reviews.length;
    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc uget top rated products
// @route GET/api/products/top
// @access public
export const getTopRatedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: "-1" }).limit(4);
  res.json(products);
});
