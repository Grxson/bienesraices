import {exit} from 'node:process'
import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
import db from "../config/db.js";
import {Categoria, Precio, Usuario} from '../models/index.js'
const importarDatos = async () => {

    try {

        //Autenticar

        await db.authenticate()

        //Generar las columnas
        await db.sync()

        //Insertar datos 
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos importados correctamente')
        exit()  //Exit en 0 es de que es correcto el proceso y en caso de pasar 1 significa que hubo un error
        
    } catch (error) {
        console.log(error)
        exit(1) //Forma de determinar los procesos
        //Es para parar el error al instante 
    }
}

const eliminarDatos = async () => {
    try {
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ])
        await db.sync({force: true}) //Eliminar datos de las bases de datos
        console.log('Datos Eliminados correctamente')
        exit()
    } catch (error) {
        error(1)
    }
}

if(process.argv[2] === "-i") {
    importarDatos();
}

if(process.argv[2] === "-e") {
    eliminarDatos();
}