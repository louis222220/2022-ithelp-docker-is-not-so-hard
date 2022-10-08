import Router from 'express';
import { Sequelize } from 'sequelize';
import config from '../config/config.js';

const router = Router();

const sequelize = new Sequelize(config.development);

router.get('/test-connection', async (_, res) => {
	const result = await sequelize.query('select 1+1');
	return res.json({ result });
});


export default router;
