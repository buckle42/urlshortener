// server.js
// where your node app starts

// init project
const express = require('express')
const ipware = require('ipware')
const urlExists = require('url-exists')
const mongodb = require('mongodb')
const hash = require('object-hash')
const app = express()

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// mongoDB connect

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// lets us know page has loaded
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// this works
app.get("/*", function (req, res, next) {
  if (req.params[0].length === 5) {
  var urlLong = 'https://fantastic-url-shortener.glitch.me/' + req.params[0]
  console.log(req.params[0])
  var redirect = '';
  var url = process.env.URL
  var mongoClient = mongodb.MongoClient
  mongoClient.connect(url, function(err, client) {
        var db = client.db('urldb')
          if (err) {
          console.log("There was an error connecting to the DB: " + err)
          } else {
          console.log("Connected successfully to the server")
            console.log(urlLong)
          db.collection('urls').findOne({newurl: urlLong}, function(err,result) {
                    if (err) {
                    console.log('There was an error: ' + err)
                    } else {
                    console.log(result.url)
                    res.redirect(result.url)
                    client.close()
                    }
                })
          }
  })} else {
    next()
  }
})

// use '*' to allow for an http:// or https:// url to be passed at end of submitted url, otherwise browser
// will try to visit https://fantastic-url-shortener.glitch.me/url/http://www.google.com and have an error
app.get('/url/*', (req,res) => {
     //creates connection to mongodb
    var mongoClient = mongodb.MongoClient
    var url = process.env.URL
    mongoClient.connect(url, function(err, client) {
        var db = client.db('urldb')
          if (err) {
          console.log("There was an error connecting to the DB: " + err)
          } else {
          console.log("Connected successfully to the server")
          var urlLong = req.params[0]
          urlExists(urlLong, function(err, exists) {
            if (exists === true) {
            var hashid = hash(urlLong)
            db.collection('urls').insertOne(
                {
                  url: urlLong,
                  newurl: 'https://fantastic-url-shortener.glitch.me/' + hashid.substring(0,5)
                })
                console.log('record inserted')
                db.collection('urls').findOne({url:urlLong}, function(err,result) {
                    if (err) {
                    console.log('There was an error: ' + err)
                    } else {
                    res.send(JSON.stringify("Submitted URL: " + result.url + " Shortened URL: " + result.newurl))
                    client.close()
                    }
                })
          } else {
            res.send('There was an error with the URL, please type in a valid URL example: https://www.url.com NOTE: if the URL is not a reachable URL it will not work')
          }
        })
      }
    })
})
                                                                                                                                                                                                
                                     
   
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
 