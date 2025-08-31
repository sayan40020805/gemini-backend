import Progress from "../models/Progress.js";

// POST /api/progress/update
export const updateProgress = async (req, res) => {
  try {
    const { userId, courseId, completedLessons, totalLessons, score } = req.body;

    if (!userId || !courseId || completedLessons === undefined || totalLessons === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let progress = await Progress.findOne({ userId, courseId });

    if (progress) {
      progress.completedLessons = completedLessons;
      progress.totalLessons = totalLessons;
      progress.score = score || progress.score;
      progress.updatedAt = new Date();
    } else {
      progress = new Progress({
        userId,
        courseId,
        completedLessons,
        totalLessons,
        score: score || 0,
      });
    }

    await progress.save();
    res.status(200).json({ message: "Progress updated successfully", progress });
  } catch (err) {
    console.error("Update progress error:", err.message);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// GET /api/progress/:userId
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.find({ userId }).populate("courseId");
    res.status(200).json(progress);
  } catch (err) {
    console.error("Get user progress error:", err.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};