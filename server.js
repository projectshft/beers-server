var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/beers');

var BeerModel = require("./models/BeerModel");
var { ReviewModel } = require("./models/ReviewModel");

var app = express();

app.use(function( req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.get('/beers', function (req, res) {
  BeerModel.find(function (error, beers) {
    res.send(beers);
  });
});

app.get('/beers/:id',  function(req, res, next) {
  BeerModel.findById(req.params.id, function (error, beer) {
    res.json(beer);
  });
});

app.post('/beers', function (req, res, next) {
  console.log(req.body);

  var beer = new BeerModel(req.body);


  beer.save(function(err, beer) {
    if (err) { return next(err); }

    res.json(beer);
  });
});

app.put('/beers/:id',  function(req, res, next) {
  BeerModel.findById(req.params.id, function (error, beer) {
    if (req.body.name) {
      beer.name = req.body.name;
    }

    if (req.body.style) {
      beer.style = req.body.style;
    }

    if (req.body.image_url) {
      beer.image_url = req.body.image_url;
    }

    if (req.body.abv) {
      beer.abv = req.body.abv;
    }

    if (req.body.reviews) {
      beer.reviews = req.body.reviews;
    }

    beer.save(function(err, beer) {
      if (err) { return next(err); }

      res.json(beer);
    });
  });
});

app.delete('/beers/:id', function (req, res) {
  BeerModel.findById(req.params.id, function (error, beer) {
    if (error) {
      res.status(500);
      res.send(error);
    } else {
      beer.remove();
      res.status(204);
      res.end();
    }
  });
});

app.post('/beers/:id/reviews', function(req, res, next) {
  BeerModel.findById(req.params.id, function(err, beer) {
    if (err) { return next(err); }

    var review = new ReviewModel(req.body);


    BeerModel.update(
      { _id: beer._id },
      { $push: { reviews: review}},
      function () {
        beer.save(function (err, beer) {
          if (err) { return next(err); }
    
          res.json(review);
        });   
      }
    )
  });
});

app.delete('/beers/:beer/reviews/:review', function(req, res, next) {
  BeerModel.findById(req.params.beer, function (err, beer) {
    for (var i = 0; i < beer.reviews.length; i ++) {
      if (beer.reviews[i]["_id"] == req.params.review) {
        beer.reviews.splice(i, 1);
        beer.save();
        res.status(204);
        res.end();
      }
    }
  });
});

var port = process.env.PORT || 4000;

app.listen(port, function () {
  console.log('Listening on port ' + port);
});
