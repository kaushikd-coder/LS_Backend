import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorhandler.js";
import asyncErrorHandler from "../middleware/catchAsyncErrors.js"

//* Create New Order
export const newOrder = asyncErrorHandler(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(200).json({
        success: true,
        order,
    });
})

//* Get Single Order
export const getSingleOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('No Order Found with this ID', 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
})

//* Get Logged in User Orders
export const myOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
})

//* Get All Orders - ADMIN
export const getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })
})

//* Update / Process Order - ADMIN
export const updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('You have already delivered this order', 400));
    }

    if(req.body.orderStatus === 'Shipped') {
        order.orderItems.forEach(async (item) => {
            await updateStock(item.product, item.quantity);
        })
    }

    order.orderStatus = req.body.status;
    
    if(req.body.status === 'Delivered') {
        order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
        success: true,
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}

//* Delete Order - ADMIN
export const deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('No Order Found with this ID', 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
    })
})