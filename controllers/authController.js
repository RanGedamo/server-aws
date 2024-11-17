const User = require('../models/User');

// רישום משתמש חדש
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // בודק אם המייל כבר קיים במערכת
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // יצירת משתמש חדש
    const user = new User({
      email,
      password // אין הצפנה כאן
    });

    await user.save();

    res.status(201).json({ success: 'Registration successful' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

// התחברות משתמש
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // בדיקה אם הסיסמה נכונה (לא בהשוואת הצפנה)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ success: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

// מחיקת משתמש לפי ID (Admin בלבד)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// עדכון משתמש
exports.updateUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updateData = { email };

    // אם סיסמה חדשה נשלחת, נעדכן אותה
    if (password) {
      updateData.password = password; // אין הצפנה כאן
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
