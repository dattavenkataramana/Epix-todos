const express = require('express');
const router = express.Router();
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskControllers');

router.get('/', getAllTasks);
router.get('/:taskId', getTaskById);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
