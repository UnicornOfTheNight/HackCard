# EduGen — AI-Powered Adaptive Exam Generator

> Hackathon demo · Adapt any exam for dyslexic students in seconds using Claude AI.

## Setup

```bash
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

## .env
```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxx
```

## Stack
- React + Vite
- Claude Sonnet (Anthropic API)
- pdf.js · mammoth.js · html2pdf.js

## User flow
1. Teacher uploads exam (PDF or DOCX)
2. Selects dyslexia profile
3. Claude rewrites it instantly
4. Download or print the adapted version
