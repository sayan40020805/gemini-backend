// backend/routes/youtubeRoutes.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_RESULTS = 10;

// Route to fetch YouTube videos
router.get("/videos", async (req, res) => {
  const { query = "coding tutorial", pageToken = "" } = req.query; // Allow dynamic query

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: YOUTUBE_API_KEY,
          q: query, // Use the dynamic query parameter
          part: "snippet",
          type: "video",
          maxResults: MAX_RESULTS,
          pageToken,
        },
      }
    );

    // Check if response contains items
    if (!response.data.items || !Array.isArray(response.data.items)) {
      return res
        .status(500)
        .json({ error: "Invalid response format from YouTube API" });
    }

    const items = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url, // Include thumbnail URL
    }));

    // Ensure the response structure is correct
    return res.json({
      videos: items,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
});

export default router;