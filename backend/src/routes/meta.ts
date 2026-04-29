import express from "express";
import { getApiCatalog } from "../controllers/metaController.js";

const router = express.Router();

router.get("/endpoints", getApiCatalog);

export default router;
