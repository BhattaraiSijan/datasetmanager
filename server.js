const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Keep track of uploaded datasets
const datasets = [];

app.use(fileUpload());
app.use(express.static('public'));

// Serve the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Handle dataset upload
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    const { datasetName, description } = req.body;
    const sampleFile = req.files.sampleFile;
  
    if (!datasetName || !description || !sampleFile) {
      return res.status(400).send('Missing required fields.');
    }
  
    const fileName = datasetName.replace(/\s+/g, '_').toLowerCase() + '.xlsx'; // Ensure a unique filename
  
    sampleFile.mv(path.join(__dirname, 'public', fileName), (err) => {
      if (err) return res.status(500).send(err);
  
      // Keep track of uploaded dataset
      datasets.push({
        name: datasetName,
        description: description,
        file: fileName,
      });
  
      res.redirect('/admin');
    });
  });
  

// Serve the index page with dataset list
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to get the list of datasets
app.get('/datasets', (req, res) => {
  res.json(datasets);
});

// Serve dataset files for download
app.get('/download', (req, res) => {
  const { file } = req.query;
  res.download(path.join(__dirname, 'public', file));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
