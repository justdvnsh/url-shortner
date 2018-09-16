'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var dns = require('dns');
var validUrl = require('valid_url');
var shortId = require('shortid');
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

var linkSchema = mongoose.Schema({
  url: String
})

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl/new',function(req,res){
    var url = req.body.url;
    if(validUrl(url)){
        mongo.connect(process.env.MONGO_URI,function(err,db){
            if(err){
                res.end('what the fuck is going on');
                return console.log(err);
            } else {
                var urlList = db.collection('urlList');
                var short = shortId.generate();
                urlList.insert([{url: url, short: short}],function(){
                    var data = {
                        original_url: url,
                        short_url: 'http://'+req.headers['host']+'/'+short
                    }
                    db.close();
                    res.send(data);
                });
            }
        });
    } else {
        var data = {
            error:'Are you fucking kidding me ? :('
        }
        res.json(data);
    }
    // res.end(req.params.url);
});
app.get('/:id',function(req,res){
  var id = req.params.id;
  mongo.connect(process.env.MONGO_URI,function(err,db){
      if(err){
          return console.log(err);
      } else {
          var urlList = db.collection('urlList');
          urlList.find({short:id}).toArray(function(err,docs){
              if(err){
                  res.end('what the fuck is going on')
                  return console.log('read',err);
              } else {
                    // console.log(docs.length);
                    if(docs.length>0){
                        db.close();
                        res.redirect(docs[0].url);
                    } else {
                        db.close();
                        res.end('what the fuck is going on')
                    }
              }
          })
      }
  })
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});