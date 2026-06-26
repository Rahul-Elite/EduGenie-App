const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

let transporter;


async function setupTransporter() {
  try {
    if (process.env.RESEND_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
      console.log("✅ Resend SMTP transporter ready (smtp.resend.com:465)");
    }
    else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.EMAIL_PORT) || 465;
      const secure = process.env.EMAIL_SECURE !== 'false'; // default to true for SSL (port 465)

      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
      console.log(`✅ SMTP transporter ready (${host}:${port})`);
    } 
    else {
      console.log("Attempting to initialize Ethereal email transporter...");
      // Wrap ethereal account creation with a 4-second timeout to prevent connection hang
      const createTestAccountPromise = nodemailer.createTestAccount();
      const testAccount = await Promise.race([
        createTestAccountPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal setup timeout')), 4000))
      ]);

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log("Ethereal transporter ready");
    }
  } catch (err) {
    console.error("Error setting transporter, falling back to console-only mock:", err.message);
    transporter = {
      sendMail: async (options) => {
        console.log("📨 [MOCK EMAIL] To:", options.to, "Subject:", options.subject);
        return { messageId: 'mock-id' };
      }
    };
  }
}

(async () => {
  await setupTransporter();
})();



router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!transporter) {
      await setupTransporter();
    }
    if (!transporter) {
      return res.status(500).json({ message: "Email service not ready. Please try again." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: 'User already exists and verified' });
      } else {
        await User.deleteOne({ email });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    const newUser = new User({
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    await newUser.save();

    const fromEmail = process.env.RESEND_API_KEY 
      ? (process.env.EMAIL_USER || 'onboarding@resend.dev')
      : (process.env.EMAIL_USER || 'test@ethereal.email');

    const mailOptions = {
      from: `"EduGenie" <${fromEmail}>`,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP is ${otp}. It expires in 2 minutes.`,
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 2 minutes.</p>
      `
    };

    let emailSent = false;
    let previewUrl = '';
    try {
      // Set a 6-second timeout for SMTP send to prevent API requests from hanging indefinitely
      const info = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP send timeout')), 6000))
      ]);
      emailSent = true;
      console.log(` Email sent to: ${email}`);
      if (!process.env.EMAIL_USER && info && typeof nodemailer.getTestMessageUrl === 'function') {
        previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(` Preview URL: ${previewUrl}`);
      }
    } catch (mailErr) {
      console.error("❌ Email sending failed or timed out:", mailErr.message);
    }

    console.log(` OTP Generated: ${otp} for ${email}`);

    res.status(201).json({
      message: 'User created. Please verify OTP.',
      requiresOtp: true
    });

  } catch (error) {
    res.status(500).json({ message: 'Signup error', error: error.message });
  }
});



router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'Already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});


router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated', isVerified: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found', isVerified: false });
    }

    res.json({
      isVerified: true,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token', isVerified: false });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});


module.exports = router;