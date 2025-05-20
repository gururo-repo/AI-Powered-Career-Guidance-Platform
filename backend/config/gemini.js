import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not defined in environment variables');
}
