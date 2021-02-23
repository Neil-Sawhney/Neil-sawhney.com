const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const dials = require('../models/dials.js');


router.get('/',(req, res, next) => { 

	//const id = req.params.Id;
	dials.find(/*{_id: '600fad262261d474813008f8'}*/).exec().then(doc => {
		console.log(doc);
		res.status(200).json(doc);
		message: 'GET request for dials'
	})
	.catch(err => { 
		console.log(err);
		res.status(500).json({error: err});
	});

	/*
	res.status(200).json({
		message: 'GET request for dials'
	})
	*/
});

router.get('/:Id',(req, res, next) => { 

	const id = req.params.Id;
	dials.find({_id: id}).exec().then(doc => {
		console.log(doc);
		res.status(200).json(doc);
		message: 'GET request for dials'
	})
	.catch(err => { 
		console.log(err);
		res.status(500).json({error: err});
	});

	/*
	res.status(200).json({
		message: 'GET request for dials'
	})
	*/
});
router.post('/',(req, res, next) => { 
	dials.update({_id: req.body._id},{$set: {data: req.body.data, status: req.body.status}}).exec().then(result => {
		console.log(result);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		})
	});
	dials.find({_id: req.body._id}).exec().then(doc => {
		res.status(200).json(doc);
	});

	


	/*
	const status = new dials({
		_id: new mongoose.Types.ObjectId(),
	});

	status.save().then(result => {
		console.log(result);
	}
	).catch(err => console.log(err));

	res.status(200).json({
		message: 'POST request for dials',
	});
	*/


});
 
 
module.exports = router;
