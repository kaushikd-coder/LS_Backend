import express from "express";
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getAdminProducts,
    getProductReviews,
    deleteReview
} from "../controllers/productController.js";
import {
    authorizeRoles,
    isAuthenticated
} from "../middleware/auth.js";

const router = express.Router();


router.route('/products').get(getAllProducts);

router.route('/admin/products').get(isAuthenticated, authorizeRoles("admin"), getAdminProducts);

router.route('/admin/product/new').post(isAuthenticated, authorizeRoles("admin"), createProduct);

router
    .route('/admin/product/:id')
    .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);
    
    router.route('/product/:id').get(getProductDetails);

    router.route('/review').put(isAuthenticated, createProductReview);

    router.route('/reviews')
    .get(getProductReviews)
    .delete(isAuthenticated, deleteReview);


export default router;