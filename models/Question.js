const mongoose = require('mongoose');

// Answer Schema
const answerSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Question Schema
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    answers: [answerSchema] // Embedding answers within the question schema
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
