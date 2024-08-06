const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require("cors");

const app = express();
const port = 3001; // Choose your preferred port

// Middleware to handle JSON requests
app.use(express.json());
app.use(cors());

// Endpoint to handle image uploads
app.post('/upload', (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).send('No image data provided.');
  }

  // Extract base64 string from the request body
  const base64Image = image.replace(/^data:image\/jpeg;base64,/, '');

  // Save image to a file
  const filePath = path.join(__dirname, 'uploads', 'uploaded_image.jpg');
  fs.writeFile(filePath, base64Image, 'base64', (err) => {
    if (err) {
      return res.status(500).send('Failed to save image.');
    }

    res.send({ message: 'Image uploaded successfully!' });
  });
});

// Create the uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
