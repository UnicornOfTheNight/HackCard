# EduGen — AI-Powered Adaptive Exam Generator

> Hackathon demo · Adapt any exam for dyslexic students in seconds using Google Gemini.

## Setup

```bash
npm install
cp .env.example .env
# Add your Google AI API key to .env
npm run dev
```

## .env
```
VITE_GOOGLE_API_KEY=AIzaSyxxxxxxx
```

## Stack
- React + Vite
- Google Generative AI (`gemini-2.5-flash`)
- pdf.js · mammoth.js · html2pdf.js

## User flow
1. Teacher uploads exam (PDF or DOCX)
2. Selects dyslexia profile
3. Google Gemini rewrites it instantly
4. Download or print the adapted version
