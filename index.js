const apiPath = '/api/';

const version = 'v1';

//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');
const { query } = require('express');

const app = express();

//Port environment variable already set up to run on Heroku
let port = 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//Our id counters
let nextTuneId = 4;
let nextGenreId = 2;

//Set Cors-related headers to prevent blocking of local requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
var tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];

let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"}
];

//Your endpoints go here

//Read all tunes
app.get(apiPath + version + '/tunes', (req, res) => {
    let returnArray = [];
    let queryParams = req.query;
    if ('filter' in queryParams) {
        for (let i=0;i<genres.length;i++) {
            if (genres[i].genreName == queryParams.filter) {
                for (let j=0;j<tunes.length;j++) {
                    if (tunes[j].genreId == genres[i].id) {
                        returnArray.push({id:tunes[j].id, name: tunes[j].name, genreId: tunes[j].genreId});
                    }
                }  
            }
        }
    }
    else {
        for (let i=0;i<tunes.length;i++) {
            returnArray.push({id:tunes[i].id, name: tunes[i].name, genreId: tunes[i].genreId});
        }
    }

    res.status(200).json(returnArray);
});

// Read all individual tunes
app.get(apiPath + version + '/genres/:genresId/tunes/:tunesId', (req, res) => {
    for (let i = 0; i < tunes.length; i++) {
        if (tunes[i].genreId == req.params.genresId && tunes[i].id == req.params.tunesId) {
            return res.status(200).json(tunes[i]);
        }
    }
    res.status(404).json({ 'message': "Tune with id " + req.params.tunesId + " and genreId " + req.params.genresId + " does not exist." });
});


// Create new tune
app.post(apiPath + version + '/genres/:genresId/tunes', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.content === undefined ) {
        res.status(400).json({ 'message': "Tunes require a name & content of tune in the request body" });
    } else {
        let content = req.body.content;

        if (Array.isArray(content) == false || content.length ===0) {
            return res.status(400).json({ 'message': "The content attribute must be a non-empty array of objects, each of which has the note, timing, and duration attributes." });
        }
        else{
            for (let j=0;j<content.length;j++) {
                if (!("note" in content[j] && "duration" in content[j] && "timing" in content[j])) {
                    return res.status(400).json({'message': "The content attribute must be a non-empty array of objects, each of which has the note, timing, and duration attributes."});
            }
            }
            
            for (let i=0;i<genres.length;i++) {
                if (genres[i].id == req.params.genresId) {
                    let newTune = {  id: nextTuneId , name: req.body.name, genreId: req.params.genresId, content: req.body.content };
                    tunes.push(newTune);
                    nextTuneId++;
                    return res.status(201).json(newTune);
                }
            }
            res.status(400).json({'message': "Genre with id: " + req.params.genresId + " does not exist."});
        }
    }
});

// Partially update a tune
app.put(apiPath + version + '/genres/:genresId/tunes/:tunesId', (req, res) => {
    if (req.body === undefined && req.body.name === undefined && req.body.content === undefined && req.body.genreId === undefined) {
        return res.status(400).json({ 'message': "To update a tune, at least one attribute is needed (name, content, genreId)." });
    } else {

        for (let i = 0; i < tunes.length; i++) {
            if (tunes[i].id == req.params.tunesId && tunes[i].genreId == req.params.genresId) {
                if (req.body.name != undefined) {
                    tunes[i].name = req.body.name;
                }
                if (req.body.content != undefined) {
                    tunes[i].content = req.body.content;
                }
                if (req.body.genreId != undefined) {
                    tunes[i].genreId = req.body.genreId;
                }
                return res.status(200).json(tunes[i]);
            } 
        }
        res.status(404).json({ 'message': "Tune with id " + req.params.tunesId + " and genreId" + req.params.genresId + " does not exist." });
    }
});


// Genre endpoints
// Read all genres
app.get(apiPath + version + '/genres', (req, res) => {
    let returnArray = [];
    for (let i=0;i<genres.length;i++) {
        returnArray.push({id:genres[i].id, genreName: genres[i].genreName});
    }
    return res.status(200).json(returnArray);
});

//Create new genre
app.post(apiPath + version + '/genres', (req, res) => {
    if (req.body === undefined || req.body.genreName === undefined ) {
        res.status(400).json({ 'message': "Genres require a name of genre in the request body" });
    } 
    else {
        let genreName = req.body.genreName;
        for (let i = 0; i < genres.length; i++) {
            if (genres[i].genreName == genreName) {
                return res.status(400).json({ 'message': "Genres can't have the same name" });
            }
        }

        let newGenre = { id: nextGenreId, genreName: req.body.genreName };
        genres.push(newGenre);
        nextGenreId++;
        res.status(201).json(newGenre);
    }
});

// delete a genre
app.delete(apiPath + version + '/genres/:genresId', (req, res) => {
    // check if any tunes exist in the genre
    for (let j = 0; j < tunes.length; j++) {
        if (tunes[j].genreId == req.params.genresId){
            return res.status(400).json({'message': "Cannot delete genres with exising tunes."});
        }
    }
    for (let i = 0; i < genres.length; i++) {
        if (genres[i].id == req.params.genresId) {
            let returnArray = [];
            //iterate reverse, so that splice doesn't break the indexing
            for (let j = genres.length - 1; j >= 0; j--) {
                if (genres[i].id) {
                returnArray.push(genres.splice(j, 1));
                return res.status(200).json(returnArray);
                }
            } 
        }
    }
    res.status(404).json({ 'message': "Genre with id:  " + req.params.genresId + " does not exist" });
});

app.use('*', (req, res) => {
    res.status(405).send('Operation not supported.');
});

//Start the server
app.listen(port, () => {
    console.log('Tune app listening on port + ' + port);
});
