import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/workflow-n8n";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: name || ""
    });

    await user.save();
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// JWT auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("=== AUTH DEBUG ===");
  console.log("authHeader = ", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Token format issue");
    return res.status(401).json({ error: "Missing or invalid token" });
  }
  
  const token = authHeader.split(" ")[1];
  console.log("token = ", token);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("decoded = ", decoded);
    req.user = decoded;
    console.log("=== AUTH SUCCESS ===");
    next();
  } catch (err) {
    console.log("JWT verification error = ", err.message);
    console.log("=== AUTH FAILED ===");
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// POST /send-email (protected)
app.post("/send-email", auth, async (req, res) => {
  try {
    console.log("Sending email");
    const { to, subject, text, message, sentiment, polarity } = req.body;
    
    if (!to || !subject || !text) {
      console.log("Missing fields");
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("to = ", to);
    console.log("subject = ", subject);
    console.log("text = ", text);

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("message = ", message);
    console.log("sentiment = ", sentiment);
    console.log("polarity = ", polarity);

    // Save message to database if sentiment data is provided
    if (message && sentiment && polarity !== undefined) {
      console.log("Saving message to database");
    
      const user = await User.findById(req.user.userId);
      if (user) {
        const newMessage = new Message({
          user: user._id,
          content: message,
          sentiment,
          polarity,
          recipient: to,
          emailSent: true,
          emailSentAt: new Date()
        });
        await newMessage.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user messages (protected)
app.get("/messages", auth, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Get user profile (protected)
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.toJSON());
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// Health check
app.get("/", (req, res) => res.send("Node.js Email Sender is running."));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));