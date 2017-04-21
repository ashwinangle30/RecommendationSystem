var express = require('express');
var router = express.Router();
var mongoconn = require('./mongodb');//mongo
var geolib = require('geolib');

/* GET home page. */
router.get('/signup', function(req, res, next) {
  console.log('Requested signup page');
  res.render('signup', { title: 'Restaurant Recommendation System' });
});
router.post('/api/signup', function(req, res) {
  console.log('---------------------------------------------------\n'); //please maintain this order while logging
  console.log('Request email comming in ' +req.body.email);
  console.log('Request password comming in ' +req.body.password);
  console.log('Request firstname comming in ' +req.body.firstname);
  console.log('Request lastname comming in ' +req.body.lastname);
  console.log('Request address comming in ' +req.body.address);
  console.log('Request zipcode comming in ' +req.body.Zipcode);
  console.log('Request cuisine comming in ' +req.body.cuisine);
  console.log('Request state comming in ' +req.body.state);
  console.log('Request contactnumber comming in ' +req.body.contactnumber);
  console.log('---------------------------------------------------\n'); //please maintain this order while logging
  mongoconn.connect(function(_connection){
    var userdata = _connection.collection('userdata');
    userdata.insert({
      "email":req.body.email,
      "password":req.body.password,
      "firstname":req.body.firstname,
      'lastname':req.body.lastname,
      "address": req.body.address,
      "zipcode": req.body.zipcode,
      "cuisine":req.body.cuisine,
      "state":req.body.state,
      "contactnumber":req.body.contactnumber
  });
    console.log('Got result from DB');
    result = {"condition":"success"};
    console.log('Going to release DB connection to the Pool');
    res
    .status(200)
    .json(result);
    return;
  });
});

router.get('/', function(req, res, next) {
  console.log('Requested home page');
  res.render('home', { title: 'Restaurant Recommendation System' });
});



router.get('/api/getRestaurantsForProfile',function(req,res){
  console.log("inside getRestaurantsForProfile");
  console.log(req.query);
  mongoconn.connect(function(_connection){
    //lat = 37.3412530
    //long = -121.8949750
    //http://localhost:3000/api/getRestaurantsForProfile?name=yashas&category=mexican&latitude=37.3412530&longitude=-121.8949750
    var restaurants = _connection.collection('restaurants');
    restaurants
    .find()
    .toArray(function(err,result){
      if(err){
        console.log(err);
        res
        .status(200)
        .json({"status":"failed"});        
      }
      var output = [];
      console.log(result.length);
      
      var range = 16100; //10 miles
      if(result.length != 0){
        for(var index in result){
          for (var objIndex in result[index].categories){                
            if(result[index].categories[objIndex]['alias'] == req.query['category']){                  
              var dist = geolib.getDistance(
                {latitude: Number(req.query['latitude']), longitude: Number(req.query['longitude'])},
                {latitude: Number(result[index].coordinates['latitude']), longitude: Number(result[index].coordinates['longitude'])}
                );
              console.log("Distance is:"+dist);
              if(dist <= range){
                output.push(result[index]);
                console.log("Within range...........");
              }
              break;
            }
          }

        }


      }

      
      res
      .status(200)
      .json(output);
    });
  });


});

module.exports = router;
