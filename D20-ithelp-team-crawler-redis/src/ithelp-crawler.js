import axios from "axios";
import * as cheerio from 'cheerio';
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc)
dayjs.extend(timezone)

const taiwanTz = 'Asia/Taipei';

const client = axios.create({
	baseURL: 'https://ithelp.ithome.com.tw/2022ironman',
	headers: {
		'User-Agent': '',
	},
});

export async function getTeamMembers(teamId) {
	const response = await client(`signup/team/${teamId}`);
	const $ = cheerio.load(response.data);
	const memberDataItems = $('body > section > div > div:nth-child(4) > div').map((_, element) => {
		const seriesTitle = $(element).find('div.col-md-10 > a > div').text();
		const authorName = $(element).find('div.col-md-2 > div.name').text();
		const originalAuthorImageUrl = $(element).find('div.col-md-2 > div.list-photo > a > img').attr('src');
		const ironmanPageUrl = $(element).find('div.col-md-10 > a').attr('href');
		return {
			seriesTitle,
			authorName,
			ironmanPageUrl,
			originalAuthorImageUrl,
		}
	}).get();
	return memberDataItems;
}

export async function getLatestPostData(ironmanPageLink) {
	const homepageResponse = await client(ironmanPageLink);
	const $ = cheerio.load(homepageResponse.data);

	const postLengthSelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div.ir-profile-series > div.qa-list__info.qa-list__info--ironman.subscription-group > span:nth-child(2)';
	const postLengthString = $(postLengthSelector).text();
	const matches = postLengthString.match(/^共 (\d+)/);
	if (matches == null || matches.length < 2) {
		return null
	}
	const postLength = parseInt(matches[1]);
	if (postLength == 0) {
		return null;
	}

	const completionStringSelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div.ir-profile-series.ir-profile-series--done > div.qa-list__info.qa-list__info--ironman.subscription-group > span.ir-profile-days';
	const completionString = $(completionStringSelector).text();
	const isCompleted = /鐵人鍊成/.test(completionString);

	const participationDaySelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div.ir-profile-series > div.qa-list__info.qa-list__info--ironman.subscription-group > span:nth-child(1)';
	const participationDayString = $(participationDaySelector).text().trim()
	const participationDays =
		isCompleted * 30 ||
		parseInt(participationDayString.match(/參賽天數[\D]*(\d+) 天/)[1]);

	const currentPageLatestDaySelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div:nth-last-child(1) > div.profile-list__content > div.ir-qa-list__status > span';
	const currentPageLatestDayString = $(currentPageLatestDaySelector).text();
	const currentPageLatestDays = parseInt(currentPageLatestDayString.match(/^DAY[\D]*(\d+)/)[1]);

	const isLastPage = Math.ceil(participationDays / 10) == Math.ceil(currentPageLatestDays / 10);

	if (isLastPage) {
		const lastPost = $('body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div:nth-last-child(1) > div.profile-list__content');
		const latestPostedAt = lastPost.find('div.qa-list__info > a.qa-list__info-time').attr('title');
		const lastPostData = {
			latestPostTitle: (lastPost.find('h3 > a').text() ?? '').trim(),
			latestPostUrl: (lastPost.find('h3 > a').attr('href') ?? '').trim(),
			latestPostedAt: dayjs.tz(latestPostedAt, taiwanTz).toISOString(),
			postLength,
			participationDays,
		};
		return lastPostData;
	}
	else {
		const lastPage = Math.ceil(postLength / 10);
		return await getLatestPostData(`${ironmanPageLink}?page=${lastPage}`)
	}
}

/**
 * @param {number} teamId
 * @return {Promise<Array>}
 */
export async function getMembersWithPostInfo(teamId) {
	const members = await getTeamMembers(teamId);
	const promisesToGetPostInfo = members.map(async (member) => {
		try {
			const latestPostData = await getLatestPostData(member.ironmanPageUrl);
			return {
				teamId: parseInt(teamId),
				...member,
				...latestPostData,
			};
		} catch (error) {
			console.error(`getMembersWithPostInfo, team: ${teamId}`, error);
		}
	});
	const membersWithPostInfo = await Promise.all(promisesToGetPostInfo);
	return membersWithPostInfo;
}