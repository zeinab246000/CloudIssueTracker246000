const express = require('express');
const issueController = require('../controllers/issues');
const verifyTurnstile = require('../middleware/turnstile');

const router = express.Router();

router.get('/', issueController.listIssues);
router.post('/', verifyTurnstile, issueController.createIssue);
router.patch('/:id/status', issueController.updateIssueStatus);

module.exports = router;
