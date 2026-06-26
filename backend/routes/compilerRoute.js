const express = require('express');
const router = express.Router();

const judge0Languages = [
    { language: 'javascript', version: '22.08.0', id: 102 },
    { language: 'python', version: '3.12.5', id: 100 },
    { language: 'java', version: 'JDK 17.0.6', id: 91 },
    { language: 'c++', version: 'GCC 14.1.0', id: 105 },
    { language: 'cpp', version: 'GCC 14.1.0', id: 105 },
    { language: 'c', version: 'GCC 14.1.0', id: 103 },
    { language: 'go', version: '1.23.5', id: 107 },
    { language: 'rust', version: '1.85.0', id: 108 },
    { language: 'ruby', version: '2.7.0', id: 72 },
    { language: 'php', version: '8.3.11', id: 98 },
    { language: 'typescript', version: '5.6.2', id: 101 }
];

router.get('/runtimes', async (req, res) => {
    try {
        const mapped = judge0Languages.map(lang => ({
            language: lang.language,
            version: lang.version,
            aliases: []
        }));
        res.json(mapped);
    } catch (error) {
        console.error("Error fetching runtimes:", error.message);
        res.status(500).json({ error: 'Failed to fetch supported languages.' });
    }
});

router.post('/execute', async (req, res) => {
    try {
        const { language, version, code, customInput } = req.body;

        if (!language || !code) {
            return res.status(400).json({ error: 'Missing required parameters: language or code.' });
        }

        const langObj = judge0Languages.find(l => l.language === language);
        if (!langObj) {
            return res.status(400).json({ error: `Language ${language} is not supported.` });
        }

        const payload = {
            source_code: code,
            language_id: langObj.id,
            stdin: customInput || ""
        };

        const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ error: data.error || data.message || 'Execution failed' });
        }

        const hasCompileError = data.status?.id === 6 || !!data.compile_output;
        
        const pistonFormat = {
            compile: hasCompileError ? {
                stdout: "",
                stderr: data.compile_output || data.message || "Compilation Error",
                code: 1
            } : null,
            run: hasCompileError ? null : {
                stdout: data.stdout || "",
                stderr: data.stderr || data.message || "",
                code: data.status?.id === 3 ? 0 : 1,
                signal: null
            }
        };

        res.json(pistonFormat);

    } catch (error) {
        console.error("Error executing code:", error.message);
        res.status(500).json({ error: 'Internal server error during code execution.' });
    }
});

module.exports = router;
