const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const trafficLight = require('../models/trafficLight.js');


router.get('/',(req, res, next) => { 

	//const id = req.params.Id;
	trafficLight.find({_id: '600fad262261d474813008f8'}).exec().then(doc => {
		console.log(doc);
		res.status(200).json(doc);
	})
	.catch(err => { 
		console.log(err);
		res.status(500).json({error: err});
	});

	/*
	res.status(200).json({
		message: 'GET request for trafficLight'
	})
	*/
});

router.get('/:Color',(req, res, next) => { 
	trafficLight.update({_id: '600fad262261d474813008f8'},{$set: {color: req.params.Color}}).exec().then(result => {
		console.log(result);
		res.status(200).json(result);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		})
	});

/*{
	const status = new trafficLight({
		color: req.params.Color,
		_id: new mongoose.Types.ObjectId(),
	});

	status.save().then(result => {
		console.log(result);
	}
	).catch(err => console.log(err));

	res.status(200).json({
		message: 'POST request for trafficLight',
	});
	*/
});
 
 
module.exports = router;
