import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const planSchema = {
    type: Type.OBJECT,
    properties: {
        tasks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    dueDate: {
                        type: Type.STRING,
                        // you may not be able to include `pattern` in “Type” schema
                        // So consider omitting or simplifying
                    },
                    priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    notes: { type: Type.STRING },
                    emoji: { type: Type.STRING }
                },
                required: ['id', 'title', 'dueDate', 'priority'],
                additionalProperties: false
            }
        }
    },
    required: ['tasks'],
    additionalProperties: false
} as const;

app.get('/', (req, res) => res.json({ message: 'Backend running' }))

app.post('/plan', async (req, res) => {
    try {
        const { goal, horizon } = req.body as { goal?: string; horizon?: 'today' | 'week' };

        if (!goal || !horizon) {
            return res.status(400).json({ error: 'goal and horizon are required' });
        }

        const horizonText = horizon === 'today' ? 'end of today' : 'end of this week';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',  // or another supported model
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `Create a concise, actionable task plan for the goal: "${goal}". Spread tasks between now and the ${horizonText}. Keep 4–10 tasks max. Include realistic due dates.` }]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: planSchema
            }
        });

        const text = response.text;  // string JSON according to schema
        if (!text) {
            return res.status(502).json({ error: 'Model returned no response' });
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({ error: 'Model returned invalid JSON', raw: text });
        }

        return res.json(data);

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error', detail: err?.message });
    }
});

const port = process.env.PORT ?? 8787;
app.listen(port, () => console.log(`PlanBuddy API listening on http://localhost:${port}`));