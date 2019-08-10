'use strict';
require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');

const app = express();

app.use(bodyParser.json());
app.use(cors());

//Port Configuration 
const port = process.env.PORT || 3000;

app.use('/public', express.static(process.cwd() + '/public'));


//Connect to databse
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true})



//Homepage route
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Creates DB entry
app.post('/api/:shorturl(*)', function(req, res, next){
   var urlToShorten = req.params.shorturl; 
  //Regex for url
  var expression = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g;
  var regex = expression;
  
  
  if(regex.test(urlToShorten) === true){
    var short = Math.floor(Math.random()*100000).toString();
    
    var data = new shortUrl(
    {
      originalUrl: urlToShorten,
      shorterUrl: short 
    }
    );
    
    data.save, function(err) {
      if(err){
        return res.send('Error saving to DB');
      }
    };
    return res.json(data);
  }
  var data = new shortUrl({
    originalUrl: 'urlToShorten does not match standard format',
    shorterUrl: 'Invalid URL'
  });
  return res.json(data);
   });


//Query DB and forward to original url
app.get('/:urlToForward', function (req, res, next) {
        var shorterUrl = req.params.urlToForward;
  
  shortUrl.findOne({'shorterUrl': shorterUrl}, function(err, data) {
    if(err) return res.send("Error reading DB");
    var re = new RegExp("^(http|https)://", "i");
    var strToCheck = data.originalUrl;
    if(re.test(strToCheck)){
      res.redirect(301, data.originalUrl);
    }
    else{
      res.redirect(301, 'http://' + data.originalUrl);
    };
    });
  });


// app.get("/api/hello", function (req, res) {
//   res.json({greeting: 'hello API'});
// });


app.listen(port, function() {
  console.log('Node.js listening ...');
});