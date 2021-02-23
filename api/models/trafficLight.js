const mongoose = require('mongoose');
const trafficLightSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	color: String
});

module.exports = mongoose.model('trafficLight',trafficLightSchema)
