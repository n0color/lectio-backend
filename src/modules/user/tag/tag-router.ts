import { Router } from "express";
import { TagController } from "./tag-controller";

const tagController = new TagController();

export const tagRouter = Router();

tagRouter.get("/", tagController.getTags);
tagRouter.post("/", tagController.createTag);
