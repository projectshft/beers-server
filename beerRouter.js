const express = require('express');
const router = express.Router();

var BeerModel = require("./models/BeerModel");
var { ReviewModel } = require("./models/ReviewModel");

router.get('/', function (req, res) {
  BeerModel.find(function (error, beers) {
    res.send(beers);
  });
});

router.get('/:id',  function(req, res, next) {
  BeerModel.findById(req.params.id, function (error, beer) {
    res.json(beer);
  });
});

router.post('/', function (req, res, next) {
  var beer = new BeerModel(req.body);

  beer.save(function(err, beer) {
    if (err) { return next(err); }

    res.json(beer);
  });
});

router.put('/:id',  function(req, res, next) {
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

router.delete('/:id', function (req, res) {
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

router.post('/:id/reviews', function(req, res, next) {
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

router.delete('/:beer/reviews/:review', function(req, res, next) {
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

module.exports = router;
