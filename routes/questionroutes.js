const express = require('express');
const router = express.Router();
const Question = require('../models/Question');


// POST route to handle posting a question
router.post('/post-question', async (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.session.user || !req.session.user.username) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { question, answer } = req.body;
        const username = req.session.user.username;

        // Create a new question with initial answer if provided
        const newQuestion = new Question({
            question,
            username,
            answers: answer ? [{ answer }] : []
        });

        await newQuestion.save();
        res.redirect('/forum');
    } catch (err) {
        console.error('Error posting question:', err);
        res.status(500).json({ error: 'Failed to post question' });
    }
});

// GET route to fetch a specific question and its replies
router.get('/view-question/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).send('Question not found');
        }
        res.render('replyPage.ejs', { question });
    } catch (err) {
        console.error('Error fetching question:', err);
        res.status(500).send('Error fetching question');
    }
});

// Route to handle adding a reply
router.post('/view-question/:id/add-reply', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).send('Question not found');
        }

        const { answer, username } = req.body;
        const newReply = { answer, username };

        question.answers.push(newReply);
        await question.save();

        res.status(201).json(newReply);
    } catch (err) {
        console.error('Error adding reply:', err);
        res.status(500).send('Error adding reply');
    }
});
module.exports = router;
