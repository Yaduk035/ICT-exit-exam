const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');


// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://yaduk946:genericpwd.@cluster0.bygqnjf.mongodb.net/otp?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.log('Error connecting to MongoDB Atlas:', error);
});

// Define the schema for the data
const schema = new mongoose.Schema({
  username: String,
  otp: Number
});

// Define the model for the data
const Model = mongoose.model('Data', schema);

// Create an instance of Express.js
const app = express();
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve the static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// GET request handler for serving the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src','build', 'index.html'));
});

// GET request handler
app.get('/data', async (req, res) => {
  try {
    // Retrieve all data from the database
    const data = await Model.find({});
    res.json(data);
  } catch (error) {
    console.log('Error retrieving data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// POST request handler
app.post('/data', async (req, res) => {
  try {
    // Create a new data instance based on the JSON payload
    const newData = new Model(req.body);

    // Save the new data to the database
    await newData.save();

    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: 'yadukrishna035@outlook.com', // Replace with your Outlook email address
          pass: 'maestroyadu.' // Replace with your Outlook password
        }
      });

    const mailOptions = {
      from: 'your-email',
      to: req.body.username, // Assuming the email is passed in the request body
      subject: 'OTP Verification',
      text: `Your OTP is: ${req.body.otp}` // Assuming the OTP is passed in the request body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.json(newData);
  } catch (error) {
    console.log('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Start the server
const port = 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
