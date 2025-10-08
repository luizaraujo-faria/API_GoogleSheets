import express from 'express';
import SheetsController from '../controller/sheetsController.js';

const sheetsRouter = express.Router();

sheetsRouter.get('/sheets', SheetsController.readData);
sheetsRouter.post('/sheets', SheetsController.writeData);
sheetsRouter.patch('/sheets', SheetsController.updateData);

export default sheetsRouter;