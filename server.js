const express = require('express');
const jsonPath = __dirname + '/public/crafts/crafts.json';

const app = express();
app.use(express.static('public'));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const cors = require('cors');
app.use(cors());

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/crafts/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.status(200).send(__dirname + '/public/index.html');
});

const crafts = require(jsonPath);
app.get('/api/crafts', async (req, res) => {
    res.json(crafts);
});

const joi = require('joi');
const fs = require('fs');
const path = require('path');

const schema = joi.object({
    _id: joi.allow(""),
    name: joi.string().min(4).required(),
    description: joi.string().min(10).required(),
    supplies: joi.array().items(joi.string().min(4)).required(),
});

app.post('/api/crafts', upload.single('image'), async (req, res) => {
    const validated = schema.validate(req.body)
    if (validated.error) {
        res.status(400).send(validated.error.details[0].message);
        return;
    }

    const newCraft = {
        _id: crafts.length + 1,
        name: req.body.name,
        image: req.file.originalname,
        description: req.body.description,
        supplies: req.body.supplies,
    };
    
    crafts.push(newCraft);
    res.status(201).send('Craft added');
});

app.listen(3000, () => {
    console.log('Server listenig on port 3000');
});