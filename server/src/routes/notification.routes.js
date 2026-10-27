const express = require('express');
const router = express.Router();
const notificationService = require('../services/notification.service');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await notificationService.getForUser(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
});

router.patch('/mark-all-read', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
