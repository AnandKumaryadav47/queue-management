const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Patient = require('./models/patient');


const express = require('express');
const e = require("express");
const { createdAT } = require("./models/basemodal");
const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/hospitalQueue', {});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// TODO: ADD TO ROUTES FOLDER AND IMPORT IT HERE
app.get('', (_req, res) => {
  res.render("home");
});


app.post('/add-patient', async (req, res) => {
  const { name } = req.body;

  const lastPatient = await Patient.findOne().sort({ age: -1 });
  const age = lastPatient ? lastPatient.age + 1 : 1;

  const newPatient = new Patient({ name, age });
  await newPatient.save();
  res.redirect(`/patient/${newPatient._id}`);
});

app.get('/complete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Patient.findOneAndUpdate({ _id: id },
      { completed: true, updatedAT: Date.now() },
      { new: true }
    );
    res.redirect(`/queue`);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/error", async (req, res, next) => {
  res.render('error');
})


app.get('/patient/:id', async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  const QueueNumber = await Patient.find({ completed: false }).countDocuments();
  res.render('patient', { patient, QueueNumber });
});

app.get('/queue', async (req, res) => {
  const patients = await Patient.find({ completed: false }).sort({ createdAT: 1 });
  res.render('queue', { patients });
});

app.get('/viewall', async (req, res) => {
  const patients = await Patient.find().sort({ createdAT: 1 });
  res.render('viewall', { patients });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
