// controllers/youtubeController.js
import axios from "axios";

export const fetchVideos = async (req, res) => {
  try {
    const { query, nextPageToken = "" } = req.query;
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Validate the query parameter
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 10,
          key: apiKey,
          pageToken: nextPageToken,
        },
      }
    );

    // Log the response for debugging
    console.log("YouTube API Response:", response.data);

    // Check if response contains items
    if (!response.data.items || !Array.isArray(response.data.items)) {
      return res
        .status(500)
        .json({ error: "Invalid response format from YouTube API" });
    }

    const videos = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url, // Add thumbnail URL
    }));

    res.json({
      videos,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};