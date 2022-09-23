import axios from "axios";
import * as cheerio from 'cheerio';

const client = axios.create({
	baseURL: 'https://ithelp.ithome.com.tw/2022ironman',
	headers: {
		'User-Agent': '',
	},
});

export async function getAllTeamId(url) {
	const response = await client(url);
	const $ = cheerio.load(response.data);
	const teamSelector = 'body > div.wrapper > div > section.sec-teams-info > div > div.team-info-card';
	const teamIds = $(teamSelector).map((_, team) => {
		const teamUrl = $(team).find('div > div.col-md-9.list-card-right > div.team-name-title > a').attr('href');
		const teamId = teamUrl.split('/').at(-1);
		return teamId;
	}).get();
	return teamIds;
}

export async function getTeamMembers(teamId) {
	const response = await client(`signup/team/${teamId}`);
	const $ = cheerio.load(response.data);
	const memberDataItems = $('body > section > div > div:nth-child(4) > div').map((_, element) => {
		const seriesTitle = $(element).find('div.col-md-10 > a > div').text();
		const authorName = $(element).find('div.col-md-2 > div.name').text();
		const ironmanPageLink = $(element).find('div.col-md-10 > a').attr('href');
		return {
			seriesTitle,
			authorName,
			ironmanPageLink,
		}
	}).get();
	return memberDataItems;
}

export async function getLatestPostData(ironmanPageLink) {
	const homepageResponse = await client(ironmanPageLink);
	const $ = cheerio.load(homepageResponse.data);

	const postLengthSelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div.ir-profile-series > div.qa-list__info.qa-list__info--ironman.subscription-group > span:nth-child(2)';
	const postLengthString = $(postLengthSelector).text();
	const postLength = parseInt(postLengthString.match(/^共 (\d+)/)[1]);
	if (postLength == 0) {
		return null;
	}
	const participationDaySelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div.ir-profile-series > div.qa-list__info.qa-list__info--ironman.subscription-group > span:nth-child(1)';
	const participationDayString = $(participationDaySelector).text().trim()
	const participationDays = parseInt(participationDayString.match(/參賽天數[\D]*(\d+) 天/)[1]);

	const currentPageLatestDaySelector = 'body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div:nth-last-child(1) > div.profile-list__content > div.ir-qa-list__status > span';
	const currentPageLatestDayString = $(currentPageLatestDaySelector).text();
	const currentPageLatestDays = parseInt(currentPageLatestDayString.match(/^DAY[\D]*(\d+)/)[1]);

	const isLastPage = Math.ceil(participationDays / 10) == Math.ceil(currentPageLatestDays / 10);

	if (isLastPage) {
		const lastPost = $('body > div.container.index-top > div > div > div.board.leftside.profile-main > div.ir-profile-content > div:nth-last-child(1) > div.profile-list__content');
		const lastPostData = {
			title: (lastPost.find('h3 > a').text() ?? '').trim(),
			url: (lastPost.find('h3 > a').attr('href') ?? '').trim(),
			postedAt: lastPost.find('div.qa-list__info > a.qa-list__info-time').attr('title'),
		};
		return lastPostData;
	}
	else {
		const lastPage = Math.ceil(postLength / 10);
		return await getLatestPostData(`${ironmanPageLink}?page=${lastPage}`)
	}
}
