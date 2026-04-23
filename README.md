# 🎂 Birthday Reminder App

Sends automated birthday emails to customers daily at 7:00 AM.

## Stack
Node.js · Express · MongoDB (Mongoose) · Nodemailer (Gmail) · node-cron

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure credentials**
```bash
cp .env.example .env
```
Fill in your Gmail address, [App Password](https://myaccount.google.com/apppasswords), and MongoDB URI in `.env`.

**3. Run**
```bash
npm start
```
Visit `http://localhost:3000`


## Deployment

Deployed on [Hostless](https://birthday-app.hostless.app/)