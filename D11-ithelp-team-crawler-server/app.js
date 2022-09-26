import { Console } from 'console';
import fs from 'fs';

import { teamIds } from "./src/data.js";
import { getLatestPostData, getTeamMembers } from "./src/ithelp-crawler.js";

const myLogger = new Console({
	stdout: fs.createWriteStream("logs/ithelp.log"),
	stderr: fs.createWriteStream("logs/error.log"),
});

(async () => {
	const logger = myLogger;
	const promises = teamIds.map(async (teamId) => {
		return await getTeamMembers(teamId);
	});
	const teamsWithMembers = await Promise.all(promises);

	for (let index = 0; index < teamsWithMembers.length; index++) {
		console.log(teamsWithMembers[index])

		const getLatestPostPromises = teamsWithMembers[index].map(async (member) => {
			const latestPostData = await getLatestPostData(member.ironmanPageLink);
			return {
				member,
				latestPostData,
			};
		});
		const results = await Promise.all(getLatestPostPromises);
		logger.log(results);
		logger.log();
	}
})();

