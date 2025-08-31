import Progress from "../models/Progress.js";

// POST /api/progress/mark
export const markProgress = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({ error: "Missing userId or videoId" });
    }

    let progress = await Progress.findOne({ userId });

    if (!progress) {
      progress = new Progress({
        userId,
        watchedVideos: [videoId],
      });
    } else if (!progress.watchedVideos.includes(videoId)) {
      progress.watchedVideos.push(videoId);
    }

    await progress.save();
    res.status(200).json({ message: "Progress updated", progress });
  } catch (err) {
    console.error("Progress update error:", err.message);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// GET /api/progress/:userId
export const getProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }

    res.status(200).json(progress);
  } catch (err) {
    console.error("Fetch progress error:", err.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};
