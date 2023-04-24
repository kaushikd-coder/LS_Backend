import express from "express";
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, updatePassword, getUserDetails, updateProfile, getAllUser, updateUserRole, getSingleUser, deleteUser } from "../controllers/userController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";


const router = express.Router();

router.route('/register').post(registerUser)

router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route('/logout').post(logoutUser);

router.route('/me').get(isAuthenticated, getUserDetails)

router.route('/password/update').put(isAuthenticated, updatePassword);

router.route('/me/update').put(isAuthenticated, updateProfile);

router.route('/admin/users').get(isAuthenticated, authorizeRoles('admin') ,getAllUser)

router 
    .route("/admin/users/:id")
    .get(isAuthenticated, authorizeRoles('admin'), getSingleUser)
    .put(isAuthenticated, authorizeRoles('admin'), updateUserRole)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteUser)

export default router;