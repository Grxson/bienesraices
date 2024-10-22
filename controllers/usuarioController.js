import {check, validationResult} from 'express-validator'
import bcrypt from "bcrypt"
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/emails.js'
import { emailOlvidePassword } from '../helpers/emails.js'


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina:'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    //Validación
    await check('email').isEmail().withMessage('El Email Es Oblgatorio').run(req)
    await check('password').notEmpty().withMessage('El Password Es Obligatorio').run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
    //Errores
    return res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken(),
        errores: resultado.array(),
        
    })
}

    const {email, password} = req.body
    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Existe'}]
            
        })
    }

    //Comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
            
        })
    }

    //Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
            
        })
    }

    //Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
    console.log(token)

    //Almacenar token en una cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true
    }).redirect('/mis-propiedades')

}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}


const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //validación
    const { password, repetir_password } = req.body;
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)


    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
    //Errores
    return res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken(),
        errores: resultado.array(),
        usuario: {
            nombre: req.body.nombre,
            email: req.body.email
        }
        
    })
}

    //Extraer los datos
    const {nombre, email} = req.body
    //Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({where: {email}})

    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Ya existe una cuenta con el mismo correo'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
            
        })
    }
    // const usuario = await Usuario.create(req.body)

    // res.json(usuario )

    //Almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //Mostrar mensaje de confirmación

    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email para Confirmar Tu Cuenta'
    })
}

//Función que comprueba una cuenta de usuario
const confirmar = async (req, res) => {
    const {token} = req.params;

    //Verificar si el token es valido
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al Confirmar tu Cuenta',
            mensaje: 'Hubo un Error al Confirmar tu Cuenta, Intentalo de Nuevo',
            error: true
        })
    }

    //Confirmar cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La Cuenta se Confirmo Correctamente',
    })
    
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
     //validación
     await check('email').isEmail().withMessage('Eso no parece un email').run(req)
 
     let resultado = validationResult(req)
 
     //Verificar que el resultado este vacio
     if(!resultado.isEmpty()){
     //Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
     })
  }

    //Buscar el usuario
    const {email} = req.body

    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningun usuario'}]
     })
    }

    //Generar un token y enviar un email
    usuario.token = generarId();

    await usuario.save();

    //Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Renderizar un mensaje

    res.render('templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })


}


    const comprobarToken = async (req, res) =>{

        const {token} = req.params;

        const usuario = await Usuario.findOne({where: {token}})
        if(!usuario){
            return res.render('auth/confirmar-cuenta', {
                pagina: 'Reestablece tu password',
                mensaje: 'Hubo un Error al intentar validar tu información',
                error: true
            })
        }

        //Mostrar formulario para modificar el password
        res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken()
        })


}
    const nuevoPassword = async (req, res) =>{
        //Validar el password
        await check('password').isLength({min: 6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)
        let resultado = validationResult(req)

        //Verificar que el resultado este vacio
        if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        
    })
}

        const {token} = req.params;
        const {password} = req.body;
        //Identificar quien hace el cambio

        const usuario = await Usuario.findOne({ehere: {token}})

        //hashear el nuevo password
        const salt = await bcrypt.genSalt(10)
        usuario.password = await bcrypt.hash(password, salt);
        usuario.token = null;

        await usuario.save();

        res.render('auth/confirmar-cuenta', {
            pagina: 'Password Reestablecido Correctamente',
            mensaje: 'El Password se Guardo Correctamente'
        })

    }

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}