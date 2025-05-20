import User from "../models/Users.js"
import bcrypt from "bcryptjs"

export const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
