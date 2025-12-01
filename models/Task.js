const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true // Elimina espacios al principio y final
    },
    listType: {
        type: String,
        required: true,
        trim: true // Importante para evitar duplicados por espacios ("General " vs "General")
        // Hemos quitado el ENUM para permitir listas infinitas
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', taskSchema);