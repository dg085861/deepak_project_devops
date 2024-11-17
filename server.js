
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

const app = express();
const port = process.env.PORT || 3000;

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/submit-form', limiter);

// Function to sanitize input
function sanitizeInput(input) {
  return xss(input);
}

// Set up SQLite database
const db = new sqlite3.Database('./form_submissions.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/submit-form', async (req, res) => {
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const message = sanitizeInput(req.body.message);
    
    try {
        // Insert data into the database
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO submissions (name, email, message) VALUES (?, ?, ?)`, [name, email, message], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'vikask1097.vk@gmail.com',
            subject: 'New Form Submission',
            text: `Name: ${name}
Email: ${email}
Message: ${message}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ success: false, message: 'Error processing form submission' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
