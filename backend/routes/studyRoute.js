const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mammoth = require("mammoth");
const cloudinary = require("cloudinary").v2;
const History = require("../models/history");
const authMiddleware = require("../middleware/authMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const router = express.Router();


const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 25 * 1024 * 1024 }
});


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}


router.get("/", (req, res) => {
    res.json({ message: "Study Route is Live" });
});



router.post("/upload", upload.single("file"), async (req, res) => {
    let filePath = req.file?.path;

    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const targetLanguage = req.body.language || "English";
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are a strict teacher.
                                Follow formatting rules exactly.
                                Do not use markdown or special symbols.
                                Explain in ${targetLanguage}.`
        });

        let result;
        const prompt = `Summarize the content as a teacher explaining to a student.

                        Instructions:
                        Explain only educational concepts in full deatial insimple language
                        Do not copy text
                        Focus on important ideas only

                        Write each point on a new line like this:
                        Point 1: explanation
                        Point 2: explanation
                        Point 3: explanation

                        Do not use symbols like *, #, -, or markdown formatting

                        If the topic includes coding:
                        Provide very simple Java-style pseudocode
                        Keep it beginner friendly
                        `;

        if (fileExt === ".pdf") {
            const pdfPart = fileToGenerativePart(filePath, "application/pdf");
            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }, pdfPart] }]
            });
        } else {
            const text = fileExt === ".docx"
                ? (await mammoth.extractRawText({ path: filePath })).value
                : fs.readFileSync(filePath, "utf-8");

            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${prompt}\n\n${text}` }] }]
            });
        }

        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            return res.status(400).json({ error: "AI blocked response" });
        }

        let cleanSummary = response.text();
        cleanSummary = cleanSummary.replace(/[*#_`]/g, "");

        res.json({ summary: cleanSummary });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});




router.post("/flashcards", upload.single("file"), async (req, res) => {
    let filePath = req.file?.path;

    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const targetLanguage = req.body.language || "English";
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: `Return ONLY JSON. No extra text.`
        });

        const generationConfig = {
            temperature: 0.2,
            topP: 0.9,
            topK: 40,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    flashcards: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                front: { type: "string" },
                                back: { type: "string" }
                            },
                            required: ["front", "back"]
                        }
                    }
                },
                required: ["flashcards"]
            }
        };

        const prompt = `
Create 10-12 flashcards in ${targetLanguage}.

STRICT RULES:
- Output ONLY JSON
- No explanation

Format:
{
 "flashcards":[
   {"front":"...","back":"..."}
 ]
}
`;

        let result;

        if (fileExt === ".pdf") {
            const pdfPart = fileToGenerativePart(filePath, "application/pdf");
            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }, pdfPart] }],
                generationConfig
            });
        } else {
            const text = fileExt === ".docx"
                ? (await mammoth.extractRawText({ path: filePath })).value
                : fs.readFileSync(filePath, "utf-8");

            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${prompt}\n\n${text}` }] }],
                generationConfig
            });
        }

        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            return res.status(400).json({ error: "AI blocked output" });
        }

        let data;
        try {
            data = JSON.parse(response.text());
        } catch (err) {
            console.log("RAW:", response.text());
            return res.status(500).json({ error: "Invalid JSON from AI" });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});


router.post("/save-history", authMiddleware, upload.single("file"), async (req, res) => {
    let filePath = req.file?.path;

    try {
        const { historyId, summary, quiz, flashcards } = req.body;
        
        const parsedQuiz = quiz ? JSON.parse(quiz) : undefined;
        const parsedFlashcards = flashcards ? JSON.parse(flashcards) : undefined;

        if (historyId) {
            const existingHistory = await History.findOne({ _id: historyId, user: req.user.id });
            if (!existingHistory) return res.status(404).json({ error: "History not found" });

            if (summary) existingHistory.summary = summary;
            if (parsedQuiz) existingHistory.quiz = parsedQuiz;
            if (parsedFlashcards) existingHistory.flashcards = parsedFlashcards;

            await existingHistory.save();
            return res.json({ message: "History updated successfully", history: existingHistory });
        }

        let cloudinaryUrl = null;
        if (filePath) {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto"
            });
            cloudinaryUrl = result.secure_url;
        }

        const newHistory = new History({
            user: req.user.id,
            summary: summary || "",
            quiz: parsedQuiz || [],
            flashcards: parsedFlashcards || [],
            cloudinaryUrls: cloudinaryUrl ? [cloudinaryUrl] : [],
            fileName: req.file ? req.file.originalname : ""
        });

        await newHistory.save();

        res.json({ message: "History created successfully", history: newHistory });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});


router.get("/history", authMiddleware, async (req, res) => {
    try {
        const histories = await History.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(histories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;