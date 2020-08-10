import { Router } from 'express';
import ClassesController from '../controllers/ClassesController';

const classRoute = Router();
const classesControllers = new ClassesController();

classRoute.get('/', classesControllers.index);

classRoute.post('/', classesControllers.create);

export default classRoute;
