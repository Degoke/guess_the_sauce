require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const { diskStorage } = require("multer");
const cloudinary = require('cloudinary').v2;


const app = express();

app.use(bodyParser.json());
app.set('view engine', 'ejs');


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.on("open", () => {
  console.log("database connected");
});

const upload = multer({storage: diskStorage({})})

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const sauceSchema = new mongoose.Schema({
  link: String,
  sauce: String,
  cloud_id: String,
  question: String,
  
});

const Sauce = mongoose.model('Sauce', sauceSchema);



app.get('/api', async (req, res) => {
  try {
    const guess = await Sauce.find({})
    res.render('api', {videos: guess})
  }
  catch (err) {
    console.log(err)
    res.render('api', {video: false})
  }
})

app.post("/api/upload", upload.single('sauceVideo'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {resource_type: 'video'})
    let guess = new Sauce({
      link: result.secure_url,
      sauce: req.body.sauce,
      cloud_id: result.public_id,
      question: req.body.question,
    })

    let final = await guess.save()
    res.json(final)
  }
  catch (err) {
    res.json(err)
  }
});

app.delete('/api/delete', async (req, res) => {
  try {
    let guess = await Sauce.findById(req.body.id)
    await cloudinary.uploader.destroy(guess.cloud_id)
    let result = guess.remove()
    res.json({deleted: result})
  }
  catch (err) {
    res.json(err)
  }
})
  

  
app.listen(process.env.PORT, () => {
  console.log(`listening at ${process.env.PORT}`);
});


module.exports = app