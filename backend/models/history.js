const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    summary: {
        type: String
    },

    fileName: {
        type: String
    },

    quiz: [
        {
            question: String,
            options: [String],
            answer: String
        }
    ],

    flashcards: [
        {
            question: String,
            answer: String
        }
    ],

    cloudinaryUrls: [
        {
            type: String
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }

});

historySchema.index({ createdAt: -1 });

module.exports = mongoose.model('History', historySchema);