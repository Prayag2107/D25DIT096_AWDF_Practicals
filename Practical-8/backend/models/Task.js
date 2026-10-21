const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to trim title (compatible with Mongoose 8/9 and older versions)
taskSchema.pre('save', function(next) {
    if (this.title) {
        this.title = this.title.trim();
    }
    if (typeof next === 'function') {
        next();
    }
});

module.exports = mongoose.model('Task', taskSchema);
