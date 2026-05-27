export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIX 1: Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password zaroori hain" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // FIX 2: Google-only account guard
    if (!user.password) {
      return res.status(400).json({ message: "Please sign in with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // FIX 4: Token mein email bhi rakho
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // FIX 3: console.error
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};