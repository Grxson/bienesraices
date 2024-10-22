import bcrypt from "bcrypt";
const usuarios = [
    {
        nombre: 'Gael',
        email: 'gael@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios;