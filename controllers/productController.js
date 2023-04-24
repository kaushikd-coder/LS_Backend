import asyncErrorHandler from "../middleware/catchAsyncErrors.js"
import Product from "../models/productModel.js"
import ApiFeatures from "../utils/apifeatures.js"
import ErrorHandler from "../utils/errorhandler.js"
import cloudinary from "cloudinary"
import mongoose from "mongoose"

//* Create Product --- ADMIN ONLY
export const createProduct = asyncErrorHandler(async (req, res, next) => {
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    // return res.status(200).json({message:"Yup"});
    // let images = [];

    // if (typeof req.body.images === "string") {
    //   images.push(req.body.images);
    // } else {
    //   images = req.body.images;
    // }

    // const imagesLinks = [];

    // for (let i = 0; i < images.length; i++) {
    //   const result = await cloudinary.v2.uploader.upload(images[i], {
    //     folder: "products",
    //   });

    //   imagesLinks.push({
    //     public_id: result.public_id,
    //     url: result.secure_url,
    //   });
    // }

    req.body.images = imagesLinks;

    // const product = await Product.create(req.body);
    let newProduct = new Product({
        user: new mongoose.Types.ObjectId(req.body.id),
        // user:"629af9bdcad3b70e5311031b",
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        Stock: req.body.Stock,
        images: imagesLinks,
    });
    newProduct
        .save()
        .then((savedProduct) => {
            res.status(201).json({
                success: true,
                product: savedProduct,
            });
        })
        .catch((err) => {
            res.status(400).json({
                success: false,
                error: err,
            });
        });
})

//* Get All Products
export const getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const resultPerPage = 8

    const productsCount = await Product.countDocuments()

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)

    //     let products = await apiFeatures.query;

    //   let filteredProductsCount = products.length;

    //   apiFeatures.pagination(resultPerPage);

    //   products = await apiFeatures.query;

    let products = await apiFeatures.query

    res.status(200).json({
        success: true,
        count: products.length,
        products,
        productsCount,
        resultPerPage,
    })
})

//* Get All Products (Admin)
export const getAdminProducts = asyncErrorHandler(async (req, res) => {
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products,
    })
})

//* Get a Single Product Details By its ID
export const getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        product,
    })
})

//* Update Product --- ADMIN ONLY
export const updateProduct = asyncErrorHandler(async (req, res) => {
    const { id } = req.params
    let product = await Product.findById(id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        product,
    })
})

//* Delete Product --- ADMIN ONLY
export const deleteProduct = asyncErrorHandler(async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.deleteOne()

    res.status(200).json({
        success: true,
        message: "Product is deleted",
    })
})

//* Create New Review or Update Review
export const createProductReview = asyncErrorHandler(async (req, res) => {
    const { rating, comment, productId } = req.body

    if (!rating || !comment || !productId)
        return res.status(500).json({
            error: "Missing parameters",
        })

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment)
        })
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0

    product.reviews.forEach((rev) => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length

    await product.save({
        validateBeforeSave: false,
    })

    res.status(200).json({
        success: true,
    })
})

//* Get All Reviews of a product
export const getProductReviews = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

//* Delete Review of a product
export const deleteReview = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    )

    let avg = 0

    reviews.forEach((rev) => {
        avg += rev.rating
    })

    let ratings = 0

    if (reviews.length === 0) {
        ratings = 0
    } else {
        ratings = avg / reviews.length
    }

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    )

    res.status(200).json({
        success: true,
    })
})
