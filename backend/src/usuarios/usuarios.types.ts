export type PerfilUsuario = 'usuario' | 'administrador';

export interface Usuario {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    nombreUsuario: string;
    passwordHash: string;
    fechaNacimiento: string;
    descripcionBreve: string;
    perfil: PerfilUsuario;
    imagenPerfilUrl: string | null;
    createdAt: string;
}

export type UsuarioPublico = Omit<Usuario, 'passwordHash'>;