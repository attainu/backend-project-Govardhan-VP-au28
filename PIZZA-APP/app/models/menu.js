const mongoose = require('mongoose');

const Schema = mongoose.Schema

const menuSchema = new Schema({
    name: {
        type: 'string',
        required: true
    },
    image: {
        type: 'string',
        required: true
    },
    price: {
        type: 'number',
        required: true
    },
    size: {
        type: 'string',
        required: true
    }
})



module.exports = mongoose.model('Menu', menuSchema);