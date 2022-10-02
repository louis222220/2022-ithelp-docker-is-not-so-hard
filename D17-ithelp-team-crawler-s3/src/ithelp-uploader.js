import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getMembersWithPostInfo } from './ithelp-crawler.js';

import { teamIds } from "./teams.js";

const s3Client = new S3Client({
	region: process.env.AWS_DEFAULT_REGION
});


export async function keepUploadingTeamData() {
	const minutes = 3;

	console.log(`keep to upload data of ithelp teams for every ${minutes} minutes`);

	crawlAndUploadTeamData(teamIds);
	setInterval(async () => {
		await crawlAndUploadTeamData(teamIds);
	}, minutes * 60 * 1000);
}

async function crawlAndUploadTeamData(teamIds) {
	console.log(`Start to crawl teams: `, teamIds);

	const chunkSize = 5;
	for (let i = 0; i < teamIds.length; i += chunkSize) {
		const chunkTeamIds = teamIds.slice(i, i + chunkSize);
		console.log(`Chunk teamIds: ${chunkTeamIds}`);
		const promises = chunkTeamIds.map(async (teamId) => {
			try {
				const members = await getMembersWithPostInfo(teamId);
				console.log(`Start to upload data of members for team ${teamId}`);
				await uploadTeamData(teamId, { data: members });
				console.log(`Uploaded, team: ${teamId}`);
			} catch (error) {
				console.error(`error: crawlAndUploadAllTeamData: teamId: ${teamId}`, error);
			}
		});
		await Promise.all(promises);
	}

	console.log(`All team finished`);
}

async function uploadTeamData(teamId, data) {
	const params = {
		Bucket: process.env.AWS_BUCKET,
		Key: `2022/team-${teamId}.json`,
		Body: JSON.stringify(data),
		ContentType: 'application/json',
	};
	await s3Client.send(new PutObjectCommand(params));
}
