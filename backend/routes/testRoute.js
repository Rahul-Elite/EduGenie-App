const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mammoth = require("mammoth");

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




router.post("/quiz", upload.single("file"), async (req, res) => {
    let filePath = req.file?.path;

    try {
        const targetLanguage = req.body.language || "English";
        const rawText = req.body.text; 
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const generationConfig = {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    quiz: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                options: { type: "array", items: { type: "string" } },
                                answer: { type: "string" }
                            },
                            required: ["question", "options", "answer"]
                        }
                    }
                },
                required: ["quiz"]
            }
        };

        let result;
        const prompt = `Create 15 MCQs in ${targetLanguage}.`;

        if (rawText) {
            result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${prompt}\n\n${rawText}` }] }],
                generationConfig
            });
        } else if (filePath) {
            const fileExt = path.extname(req.file.originalname).toLowerCase();
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
        } else {
            return res.status(400).json({ error: "No file or text provided" });
        }

        const response = await result.response;

        if (!response.candidates || response.candidates.length === 0) {
            return res.status(400).json({ error: "Blocked" });
        }

        res.json(JSON.parse(response.text()));

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});

module.exports = router;
