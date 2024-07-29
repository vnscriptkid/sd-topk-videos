const { Client } = require('pg');
const {createClient} = require('redis');

const globalKeys = new Set();

// PostgreSQL connection details
const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123456',
  port: 5432, // or your PostgreSQL port
});

let redisClient;

async function updateRedisTopK() {
  const query = `
    SELECT video_id, start_time, end_time, view_count
    FROM hourly_views;
  `;

  try {
    const res = await pgClient.query(query);
    
    // Clear the existing sorted set starting with 'hourly:'
    const keys = await redisClient.keys('hourly::*');
    for (const key of keys) {
      await redisClient.del(key);
      console.log('Deleted key:', key);
    }

    console.log('\n')
    for (const r of res.rows) {
        const row = new Row(r.video_id, r.start_time, r.end_time, r.view_count);
        
        const key = buildHourlyKey(row.start_time, row.end_time);
        globalKeys.add(key);
        await redisClient.zAdd(key, [{score: row.view_count, value: row.video_id}]);
        console.log('Added:', key, row.video_id, row.view_count);
    }

    console.log('Updated Redis with the latest data');
  } catch (err) {
    console.error('Error updating Redis:', err);
  } finally {
    await pgClient.end();
  }
}

async function getTopKVideosFromRedis(k) {
    for (const key of globalKeys) {
        const topK = await redisClient.zRange(key, 0, k - 1, {REV: true});
        console.log(`Top K Videos for key ${key}:`, topK);
    }
}

async function main() {
    redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    pgClient.connect();

    // Update Redis sorted set with the latest data
    await updateRedisTopK()

    // Retrieve top K videos from Redis
    await getTopKVideosFromRedis(3); // Change the value 10 to your desired K
}

function buildHourlyKey(start_time, end_time) {
    return `hourly::${start_time.toISOString()}::${end_time.toISOString()}`;
}

main().catch(console.error);

class Row {
    constructor(video_id, start_time, end_time, view_count) {
        this.video_id = video_id;
        this.start_time = new Date(start_time);
        this.end_time = new Date(end_time);
        this.view_count = parseInt(view_count);
    }
}