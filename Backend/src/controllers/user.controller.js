const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    // req.userData is set by auth middleware
    const user = await User.findById(req.userData.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, companyName } = req.body;
    const user = await User.findById(req.userData.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    // Only update companyName if user is a company
    if (user.role === 'company' && companyName) {
      user.companyName = companyName;
    }

    await user.save();
    
    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
