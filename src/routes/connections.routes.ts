import { Router } from 'express';
import ConnectionsController from '../controllers/ConnectionsController';

const connectionsRoute = Router();
const connectionController = new ConnectionsController();

connectionsRoute.get('/', connectionController.index);
connectionsRoute.post('/', connectionController.create);

export default connectionsRoute;
