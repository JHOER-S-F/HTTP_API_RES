const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const DATA_FILE = "actividades.json";

// Cargar actividades desde un archivo JSON
const cargarActividades = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [{}];
    }
};

// Guardar actividades en el archivo JSON
const guardarActividades = (actividades) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(actividades, null, 2), "utf8");
};

let actividades = cargarActividades();

// Obtener todas las actividades
app.get("/", (req, res) => {
    res.json(actividades);
});

// Obtener una actividad por ID
app.get("/actividades/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const actividad = actividades.find(a => a.id === id);
    if (!actividad) {
        return res.status(404).json({ error: "Actividad no encontrada" });
    }
    res.json(actividad);
});

// Crear una nueva actividad
app.post("/actividades", (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "Título válido requerido" });
    }

    const newActividad = { id: Date.now(), title, done: false };
    actividades.push(newActividad);
    guardarActividades(actividades);

    res.status(201).json(newActividad);
});

// Actualizar una actividad
app.put("/actividades/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    const actividad = actividades.find(a => a.id === id);
    if (!actividad) {
        return res.status(404).json({ error: "Actividad no encontrada" });
    }

    if (title !== undefined) actividad.title = title;
    if (done !== undefined) actividad.done = Boolean(done);

    guardarActividades(actividades);
    res.json(actividad);
});

// Eliminar una actividad
app.delete("/actividades/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = actividades.findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Actividad no encontrada" });
    }

    actividades.splice(index, 1);
    guardarActividades(actividades);

    res.json({ message: "Actividad eliminada" });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`servidor corriendo http://localhost:${port}`);
});
