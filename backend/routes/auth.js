const express = require('express');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (resend) {
  console.log("✅ Resend client initialized successfully");
} else {
  console.log("⚠️ RESEND_API_KEY is not defined in environment variables. Emails will run in mock/console mode.");
}



router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const fromEmail = process.env.EMAIL_USER || 'onboarding@resend.dev';

    const mailOptions = {
      from: `EduGenie <${fromEmail}>`,
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

    try {
      if (process.env.BREVO_API_KEY) {
        // Send email via Brevo API
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              name: "EduGenie",
              email: process.env.EMAIL_USER // Must be verified in Brevo
            },
            to: [
              {
                email: email
              }
            ],
            subject: "Your OTP for Signup",
            htmlContent: `
              <h2>OTP Verification</h2>
              <p>Your OTP is:</p>
              <h1 style="font-size:32px;color:#4f46e5;">${otp}</h1>
              <p>This OTP will expire in 2 minutes.</p>
            `,
            textContent: `Your OTP is ${otp}. It expires in 2 minutes.`
          })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("❌ Brevo Error:", data);
          throw new Error(data.message || "Failed to send email");
        }

        console.log("✅ Email sent successfully!");
        console.log(data);
      } else if (resend) {
        // Set a 6-second timeout for Resend API send to prevent API requests from hanging indefinitely
        await Promise.race([
          resend.emails.send(mailOptions),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Resend API send timeout')), 6000))
        ]);
        console.log(` Email sent via Resend to: ${email}`);
      } else {
        console.log(`📨 [MOCK EMAIL - NO SENDER KEY] To: ${email} | OTP: ${otp}`);
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