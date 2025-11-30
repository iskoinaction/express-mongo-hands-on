require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Task = require('./models/Task'); // Importamos el modelo

const app = express();

// --- CONEXIÓN A MONGODB ---
// Usamos la variable del archivo .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Conectado a MongoDB Atlas'))
  .catch(err => console.error('🔴 Error conectando a MongoDB:', err));

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Helmet (Permitiendo scripts inline para tu truco de Cloudflare)
app.use(helmet({
    contentSecurityPolicy: false,
}));

// Cabeceras Anti-Caché (Cloudflare Buster)
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// --- RUTAS ---

// 1. MOSTRAR TAREAS (Ahora con async/await)
app.get('/', async (req, res) => {
    try {
        // Pedimos a la base de datos que busque y filtre
        const generalTasks = await Task.find({ listType: 'General' }).sort({ createdAt: -1 });
        const workTasks = await Task.find({ listType: 'Trabajo' }).sort({ createdAt: -1 });
        
        res.render('index', { generalTasks, workTasks });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar tareas");
    }
});

// 2. DOCUMENTACIÓN
app.get('/metodologia', (req, res) => {
    res.render('metodologia');
});

// 3. AÑADIR TAREA
app.post('/add', async (req, res) => {
    const { content, listType } = req.body;
    try {
        if (content) {
            // Guardamos en Mongo en lugar del array
            await Task.create({ content, listType });
        }
        // Tu script nuclear para Cloudflare
        const dest = '/lista_node/?v=' + Date.now();
        res.send(`<script>window.location.replace("${dest}");</script>`);
    } catch (error) {
        console.error(error);
        res.redirect('/lista_node/');
    }
});

// 4. ELIMINAR TAREA
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Buscamos por _id y borramos
        await Task.findByIdAndDelete(id);
        
        // Tu script nuclear para Cloudflare
        const dest = '/lista_node/?v=' + Date.now();
        res.send(`<script>window.location.replace("${dest}");</script>`);
    } catch (error) {
        console.error(error);
        res.redirect('/lista_node/');
    }
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});