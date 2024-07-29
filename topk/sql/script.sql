-- Find top 3 most watched videos for each time window
WITH ranked_views AS (
    SELECT video_id, start_time, end_time, view_count,
           RANK() OVER (PARTITION BY start_time ORDER BY view_count DESC) AS rnk
    FROM hourly_views
)
SELECT video_id, start_time, end_time, view_count
FROM ranked_views
WHERE rnk <= 3;