import express from "express";
const router = express.Router();
import {
  createProduct,
  createProductReview,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
  getTopRatedProducts,
} from "../controllers/productController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.route("/top").get(getTopRatedProducts);
router.route("/:id/reviews").post(protect, createProductReview);
router
  .route("/:id")
  .get(getProductById)
  .delete(protect, admin, deleteProductById)
  .put(protect, admin, updateProductById);

export default router;
