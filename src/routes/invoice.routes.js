import { Router } from "express";
import { createInvoice } from "../controllers/invoice.controller.js";
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-invoice").post(verifyUserJWT, createInvoice);

export default router;
