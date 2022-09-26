import Router from 'express';
import { getMembersWithPostInfo } from './ithelp-crawler.js';


const router = Router();

router.get('/team/:teamId/members', async (req, res) => {
	const teamId = parseInt(req.params.teamId);
	if (!Number.isInteger(teamId)) {
		return res.status(400).json({
			error: 'teamId is not an integer'
		});
	}
	const members = await getMembersWithPostInfo(teamId);
	return res.json({ data: members });
});

export default router;
