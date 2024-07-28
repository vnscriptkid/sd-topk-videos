const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL connection details
const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: '123456',
	port: 5432, // or your PostgreSQL port
});

const counter = {};

function buildKey(startTime, endTime) {
	return `${startTime.toISOString()}-${endTime.toISOString()}`;
}

async function seedData() {
	
	try {
		await client.connect();
		console.log('Connected to the database.');

		// Truncate the hourly_views table
		await client.query('TRUNCATE hourly_views;');

		// Generate fake video IDs
		const videoIDs = generateVideoIDs(50);

		// Current time
		const now = new Date();

		// Insert fake data for the last 5 hours
		for (let hour = 0; hour < 5; hour++) {
			const seen = new Set();
			const endTime = new Date(now.getTime() - hour * 60 * 60 * 1000);
			const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);

			console.log('\n')
			const roundedStartTime = roundToHour(startTime);
			const roundedEndTime = roundToHour(endTime);

			for (let i = 0; i < 20; i++) {
				let videoID = videoIDs[randomIdx(videoIDs)];
				while (seen.has(videoID)) {
					videoID = videoIDs[randomIdx(videoIDs)];
				}
				seen.add(videoID);
				
				const viewCount = Math.floor(Math.random() * 1000) + 1;

				const query = `
					INSERT INTO hourly_views (start_time, end_time, video_id, view_count)
					VALUES ($1, $2, $3, $4);
				`;

				updateCounter(buildKey(roundedStartTime, roundedEndTime), videoID, viewCount);

				console.log([roundedStartTime, roundedEndTime, videoID, viewCount]);

				await client.query(query, [roundedStartTime, roundedEndTime, videoID, viewCount]);
			}
		}

		console.log('Seeded hourly_views table with fake data for the last 5 hours.');
		findTopKVideos(counter, 3)
	} catch (err) {
		console.error('Error seeding data:', err);
	} finally {
		await client.end();
		console.log('Disconnected from the database.');
	}
}

function updateCounter(key, videoID, viewCount) {
	if (!(key in counter)) {
		counter[key] = {}
	}
	if (!(videoID in counter[key])) {
		counter[key][videoID] = 0;
	}
	counter[key][videoID] = counter[key][videoID] + viewCount;
}

function generateVideoIDs(count) {
	const videoIDs = [];
	for (let i = 0; i < count; i++) {
		videoIDs.push(`video_${i + 1}`);
	}
	return videoIDs;
}

function roundToHour(date) {
	date.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0
	return date;
}

function randomIdx(arr) {
	return Math.floor(Math.random() * arr.length);
}

function findTopKVideos(counter, k) {
	const topKVideos = [];
	for (const key in counter) {
		const videoViews = counter[key];
		const sortedVideos = Object.entries(videoViews).sort((a, b) => b[1] - a[1]);
		const topKVideos = sortedVideos.slice(0, k);
		topKVideos.push({
			[key]: sortedVideos.slice(0, k),
		});
		console.log({
			[key]: sortedVideos.slice(0, k),
		})
	}
	
	return topKVideos;
}

seedData();

