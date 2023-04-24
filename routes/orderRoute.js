import express from 'express';
import {
    authorizeRoles,
    isAuthenticated
} from "../middleware/auth.js";
import {
    deleteOrder,
    getAllOrders,
    getSingleOrder,
    myOrders,
    newOrder,
    updateOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/order/new').post(isAuthenticated, newOrder);

router.route('/order/:id').get(isAuthenticated, getSingleOrder);

router.route('/orders/me').get(isAuthenticated, myOrders);

router.route('/admin/orders').get(isAuthenticated, authorizeRoles('admin'), getAllOrders)

router.route('/admin/order/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteOrder)


export default router;