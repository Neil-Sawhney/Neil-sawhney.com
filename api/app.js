const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const theDials = require('./api/dials');
const trafficLight = require('./api/trafficLight');

mongoose.connect('mongodb+srv://Neil:' + process.env.MONGO_ATLAS_PW + '@trafficlight.ogvol.mongodb.net/Neil?retryWrites=true&w=majority',
	{
		useMongoClient: true
	}
);

//logging
app.use(morgan('dev'));

//body parsing
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors

 app.use((req,res,next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if(req.method === 'OPTIONS'){
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DEL');
		return res.status(200).json({});
	}
	next();
});



//routes
app.use('/trafficLight', trafficLight);
app.use('/dials', theDials);



//errors
app.use((req,res,next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req,res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});

});

module.exports = app;
