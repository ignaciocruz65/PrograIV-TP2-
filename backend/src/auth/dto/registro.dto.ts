import { PerfilUsuario } from '../../usuarios/usuarios.types'

export interface RegistroDto {
    nombre: string
    apellido: string
    correo: string
    nombreUsuario: string
    password: string
    repetirPassword: string
    fechaNacimiento: string
    descripcionBreve: string
    perfil?: PerfilUsuario
}
