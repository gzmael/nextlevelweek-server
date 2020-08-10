import { Router } from 'express';
import classRoute from './classes.routes';
import connectionsRoute from './connections.routes';

const routes = Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Estamos decolando 👨‍💻' });
});

routes.use('/class', classRoute);
routes.use('/connection', connectionsRoute);

export default routes;
