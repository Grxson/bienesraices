import { text } from 'express';
import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS 
        }
      });

      const {email, nombre, token} = datos

      //enviar el email
      await transport.sendMail({
        from:'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html:`
            <p>Hola ${nombre}, compueba tu cuenta en bienesraices.com</p>
            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a>   </p> 
            <p>Si tu no creaste esta cuenta puedes ignorar el mensaje</p>
        `
      })
}

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
      }
    });

    const {email, nombre, token} = datos

    //enviar el email
    await transport.sendMail({
      from:'BienesRaices.com',
      to: email,
      subject: 'Reextablece tu Password en BienesRaices.com',
      text: 'Reextablece tu Password en BienesRaices.com',
      html:`
          <p>Hola ${nombre}, has solicitado reestableces tu password en bienesraices.com</p>
          <p>Presiona el siguiente enlace para generar un nuevo password: 
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer Password</a>   </p> 
          <p>Si tu no solicitaste el cambio de password puedes ignorar este mail</p>
      `
    })
}

export{
    emailRegistro,
    emailOlvidePassword
}