import Router from 'express';
import { createClient } from 'redis';
import { getMembersWithPostInfo } from './ithelp-crawler.js';


const router = Router();

const client = createClient({
	url: process.env.REDIS_URL,
});


router.get('/team/:teamId/members', async (req, res) => {
	const teamId = parseInt(req.params.teamId);
	if (!Number.isInteger(teamId)) {
		return res.status(400).json({
			error: 'teamId is not an integer'
		});
	}

	await client.connect();
	const cacheKey = `team_${teamId}`;
	const cache = await client.get(cacheKey);

	const members = cache
		? JSON.parse(cache)
		: await getMembersWithPostInfo(teamId);
	
	await client.setEx(cacheKey, 20, JSON.stringify(members));

	await client.disconnect();
	return res.json({ data: members });
});

export default router;
