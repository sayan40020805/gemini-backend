import Course from "../models/Course.js";

// Save a YouTube video for a user
export const saveCourse = async (req, res) => {
  try {
    const { userId, title, videoId, channelTitle, thumbnail } = req.body;

    const newCourse = new Course({
      userId,
      title,
      videoId,
      channelTitle,
      thumbnail,
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course saved successfully", course: newCourse });
  } catch (err) {
    res.status(500).json({ error: "Failed to save course" });
  }
};

// Get all saved courses for a specific user
export const getUserCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    const courses = await Course.find({ userId });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// Delete a saved course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};
