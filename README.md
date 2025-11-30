# 📝 To-Do List App (Full Stack Deployment & Architecture)

> **Despliegue en Producción:** [https://fjbh.net/lista_node/](https://fjbh.net/lista_node/)

Este proyecto es una **refactorización y despliegue avanzado** de una aplicación Node.js/Express. Más allá de la funcionalidad básica de una lista de tareas, el objetivo principal de este fork ha sido implementar una arquitectura de sistemas robusta, segura y escalable en un entorno VPS real, simulando un escenario de producción empresarial.

---

## 🏗️ 1. Arquitectura de Sistemas e Infraestructura

A diferencia de los despliegues automatizados en plataformas PaaS (como Vercel o Heroku), este proyecto se ha configurado manualmente en un entorno **IaaS** (Infrastructure as a Service) para tener control total sobre la red, los procesos y la seguridad.

### Infraestructura del Servidor (VPS)
- **Host:** Servidor VPS Linux (Ubuntu) gestionado mediante **HestiaCP**.
- **Process Manager:** Implementación de **PM2** para la gestión del ciclo de vida de la aplicación:
    - *Daemonización* del proceso Node.js (ejecución continua en segundo plano).
    - Configuración de scripts de **auto-arranque (`systemd`)** para garantizar la disponibilidad tras reinicios del servidor.
    - Monitorización de logs y recursos en tiempo real.

### Proxy Inverso y Enrutamiento
Para evitar exponer el puerto de la aplicación (`3000`) y aprovechar la seguridad del servidor web principal:
- **Reverse Proxy:** Configuración de reglas de reescritura en Apache/Nginx (vía `.htaccess`) para tunelizar el tráfico HTTPS público hacia `localhost:3000`.
- **Subdirectory Deployment:** Despliegue en una subruta (`/lista_node/`) en lugar de la raíz del dominio. Esto requirió refactorizar el código frontend y backend para manejar **rutas relativas** y evitar conflictos de `Base URL`.

### Optimización de CDN (Cloudflare Bypass)
Se identificó y solucionó un problema crítico de latencia de datos causado por la "Edge Cache" de Cloudflare:
- **Cache Busting:** Implementación de una estrategia de invalidación de caché mediante inyección de *timestamps* dinámicos (`?v=Date.now()`) en las redirecciones del servidor.
- **Headers HTTP:** Configuración de cabeceras `Cache-Control: no-store` para forzar la entrega de contenido fresco al cliente.

---

## 🧠 2. Lógica de Persistencia y Backend (MongoDB)

La aplicación ha sido refactorizada para abandonar el almacenamiento volátil en memoria y adoptar un modelo persistente mediante **Mongoose (ODM)** conectado a **MongoDB Atlas**. 

### El Esquema de Datos (`models/Task.js`)
Antes de cualquier operación de escritura, se define un esquema estricto que actúa como "contrato" entre el servidor y la base de datos.
```javascript
const taskSchema = new mongoose.Schema({
    content: { type: String, required: true }, // Validación: No permite tareas vacías
    listType: { 
        type: String, 
        required: true, 
        enum: ['General', 'Trabajo'] // Validación: Solo permite estas dos categorías
    },
    createdAt: { type: Date, default: Date.now } // Automatización: Fecha autogenerada
});
```

### Conexión Segura (`app.js`)
La conexión no está "hardcodeada" en el código. Se inicia al arrancar el servidor utilizando variables de entorno para inyectar credenciales sensibles de forma segura.

### Flujo de Escritura Asíncrona (POST /add)
La persistencia real ocurre en las rutas mediante operaciones asíncronas (async/await).
```javascript
app.post('/add', async (req, res) => {
    const { content, listType } = req.body;
    // Transacción: Espera (await) a que Mongo confirme la escritura en disco
    await Task.create({ content, listType });
    // Respuesta: Redirige solo cuando el dato está confirmado
});
```

**Lógica:** Al usar `await Task.create()`, el servidor Node.js detiene la ejecución de esa petición hasta recibir el "OK" de MongoDB Atlas. Esto garantiza una consistencia fuerte: el usuario nunca es redirigido a la lista hasta que el dato está físicamente guardado en la nube.

---

## 📦 Instalación y Ejecución Local

Si deseas replicar este entorno en local:

1. **Clonar el repositorio:**
```bash
   git clone https://github.com/iskoinaction/express-mongo-hands-on.git
   cd express-mongo-hands-on
```

2. **Instalar dependencias:**
```bash
   npm install
```

3. **Configurar variables de entorno:**  
   Crea un archivo `.env` en la raíz y añade tu cadena de conexión de MongoDB:
```env
   MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/todo-list
   PORT=3000
```

4. **Iniciar la aplicación:**
```bash
   npm start
   # O para desarrollo:
   # npx nodemon app.js
```

5. **Acceder:**  
   Abre tu navegador en `http://localhost:3000`

---

## 📄 Notas Académicas

Este proyecto forma parte de la asignatura de **Arquitectura Big Data & Cloud**. Es un fork educativo basado en el repositorio original de [fjbanezares](https://github.com/fjbanezares), ampliado para ser replicable a nivel IaaS.

**Desarrollado por:** Francisco José Bustos Hernández