const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId

var BeerModel = require("./models/BeerModel");
var { ReviewModel } = require("./models/ReviewModel");

router.get('/', function (req, res) {
  BeerModel.find(function (error, beers) {
    if (error) { return next(error); }
    res.send(beers);
  });
});

router.get('/:id',  function(req, res, next) {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    res.status(400);
    res.send("Missing or invalid id parameter in URL");
    return res.end();
  }
  BeerModel.findById(req.params.id, function (error, beer) {
    if (error) { return next(error); }
    if (beer) {
      res.json(beer);
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.id} not found`);
    }
  });
});

router.post('/', function (req, res, next) {
  var beer = new BeerModel(req.body);

  beer.save(function(err, beer) {
    if (err) { return next(err); }
    if (beer) {
      res.json(beer);
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.id} not found`);
    }
  });
});

router.put('/:id',  function(req, res, next) {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    res.status(400);
    res.send("Missing or invalid id parameter in URL");
    return res.end();
  }
  BeerModel.findById(req.params.id, function (error, beer) {
    if (beer) {
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
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.id} not found`);
    }
  });
});

router.delete('/:id', function (req, res) {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    res.status(400);
    res.send("Missing or invalid id parameter in URL");
    return res.end();
  }
  BeerModel.findById(req.params.id, function (error, beer) {
    if (error) { return next(error); }
    if (beer) {
      beer.remove();
      res.status(204);
      res.end();
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.id} not found`);
    }
  });
});

router.post('/:id/reviews', function(req, res, next) {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    res.status(400);
    res.send("Missing or invalid id parameter in URL");
    return res.end();
  }
  BeerModel.findById(req.params.id, function(err, beer) {
    if (err) { return next(err); }
    if (beer) {
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
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.id} not found`);
    }
    
  });
});

router.delete('/:beer/reviews/:review', function(req, res, next) {
  if (!req.params.beer || !ObjectId.isValid(req.params.beer)) {
    res.status(400);
    res.send("Missing or invalid beer id parameter in URL");
    return res.end();
  }
  if (!req.params.review || !ObjectId.isValid(req.params.review)) {
    res.status(400);
    res.send("Missing or invalid review id parameter in URL");
    return res.end();
  }
  BeerModel.findById(req.params.beer, function (err, beer) {
    if (err) { return next(error); }
    if (beer) {
      for (var i = 0; i < beer.reviews.length; i ++) {
        if (beer.reviews[i]["_id"] == req.params.review) {
          beer.reviews.splice(i, 1);
          beer.save();
          res.status(204);
          res.end();
        }
      }
    } else {
      res.status(404);
      return res.end(`Beer with id ${req.params.beer} not found`);
    }
  });
});

module.exports = router;
