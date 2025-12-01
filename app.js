require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Conectado a MongoDB Atlas'))
  .catch(err => console.error('🔴 Error conectando a MongoDB:', err));

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helmet (Permitiendo scripts inline para el fix de Cloudflare)
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

// 1. MOSTRAR TAREAS (Lógica Dinámica)
app.get('/', async (req, res) => {
    try {
        // A. Traemos TODAS las tareas ordenadas por fecha (las más nuevas primero)
        const allTasks = await Task.find().sort({ createdAt: -1 });

        // B. Sacamos los nombres de las listas que existen (para el autocompletado del input)
        // Usamos Set para que no haya repetidos: ["General", "Trabajo", "Compras"]
        const existingLists = [...new Set(allTasks.map(task => task.listType))];

        // C. Agrupamos las tareas por su lista en un objeto
        // Resultado: { "General": [tarea1], "Compras": [tarea2, tarea3] }
        const tasksByList = {};
        
        allTasks.forEach(task => {
            // Si la categoría no existe en el objeto, creamos el array vacío
            if (!tasksByList[task.listType]) {
                tasksByList[task.listType] = [];
            }
            // Añadimos la tarea a su categoría correspondiente
            tasksByList[task.listType].push(task);
        });

        // D. Enviamos todo a la vista (index.ejs)
        res.render('index', { 
            tasksByList: tasksByList, 
            existingLists: existingLists 
        });

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
        if (content && listType) {
            // Guardamos en Mongo. Como quitamos el ENUM en el modelo, acepta cualquier nombre.
            await Task.create({ content, listType });
        }
        
        // Script nuclear para Cloudflare (Refresco inmediato)
        const dest = '/lista_node/?v=' + Date.now();
        res.send(`<script>window.location.replace("${dest}");</script>`);
    } catch (error) {
        console.error(error);
        // En caso de error, volvemos a la lista segura
        res.redirect('/lista_node/');
    }
});

// 4. ELIMINAR TAREA
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Task.findByIdAndDelete(id);
        
        // Script nuclear para Cloudflare
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