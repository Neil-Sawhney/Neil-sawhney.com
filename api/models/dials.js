const mongoose = require('mongoose');

const DialsSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	data: [Number],
	status: Boolean,
});

module.exports = mongoose.model('dials',DialsSchema)
