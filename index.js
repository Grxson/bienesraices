// const express = require ('express'); //Extraes exprees de las dependencias
import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRouts from "./routes/usuarioRouts.js";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from './config/db.js';
//Crear la app
const app = express()

//Habilitar lectura datos de formularios
app.use(express.urlencoded({extended: true}))

//habilitar cookieparser
app.use(cookieParser())

//Habilitar el CSURF
app.use(csurf({cookie: true}))

//Conexión a base de datos

try {
    await db.authenticate();
    db.sync()
    console.log('Conexión correcta')    
} catch (error) {
    console.log(error)
}

//habilitar pug
app.set('view engine', 'pug')
app.set('views','./views')

//Carpeta publica
app.use(express.static('public'))

//Routing
app.use('/', appRoutes)
app.use('/auth', usuarioRouts);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes)



//definir un puerto

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
});
