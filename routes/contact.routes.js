import express from 'express';
import contactController from '../controllers/contact.controller.js';

const contactRouter = express.Router();

contactRouter.post("/query", contactController)

export default contactRouter;