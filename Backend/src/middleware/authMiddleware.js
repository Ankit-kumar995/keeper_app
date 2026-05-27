import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  // ---> बदलाव यहाँ है: अब पहले Authorization Header (Header Token) चेक होगा <---
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // 2. कुकीज़ को बैकअप (Fallback) के रूप में बाद में चेक करें
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found in cookies or headers, reject the request
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach verified user information to the request object
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired, please log in again" });
    }

    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};