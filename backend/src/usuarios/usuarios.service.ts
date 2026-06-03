import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsuarioSchema, Usuario } from './usuario.shema';
import { UsuarioPublico } from './usuarios.types';

@Injectable()
export class UsuariosService {
    // inyeccion de el modelo de usuario de usuario.shema
    constructor(
        @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>
    ) {}

    //  / todo es asíncrono porque lo conectamos a mongodb 
    async crear(nuevoUsuario: any): Promise<UsuarioPublico> {
        const usuarioCreado = await this.usuarioModel.create(nuevoUsuario);
        return this.quitarContrasena(usuarioCreado.toObject());
    }

    async listar(): Promise<UsuarioPublico[]> {
        const usuarios = await this.usuarioModel.find().lean();
        return usuarios.map(usuario => this.quitarContrasena(usuario as any));
    }

    async buscarPorCorreoOCuenta(textoIngresado: string): Promise<any | null> {
        const textoLimpio = textoIngresado.trim().toLowerCase();

        return this.usuarioModel.findOne({
            $or: [
                { correo: textoLimpio },
                { nombreUsuario: textoLimpio }
            ]
        }).lean();
    }

    async existeCorreoOCuenta(correo: string, nombreUsuario: string): Promise<boolean> {
        const correoLimpio = correo.trim().toLowerCase();
        const usuarioLimpio = nombreUsuario.trim().toLowerCase();

        const usuarioExistente = await this.usuarioModel.findOne({
            $or: [
                { correo: correoLimpio },
                { nombreUsuario: usuarioLimpio }
            ]
        }).lean();

        return !!usuarioExistente; // retornamos true si lo encontró  false si no
    }

    quitarContrasena(usuario: any): UsuarioPublico {
        // retornamos los datos del usuario sin la contraseña
        return {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            nombreUsuario: usuario.nombreUsuario,
            fechaNacimiento: usuario.fechaNacimiento,
            descripcionBreve: usuario.descripcionBreve,
            perfil: usuario.perfil,
            imagenPerfilUrl: usuario.imagenPerfilUrl,
            createdAt: usuario.createdAt
        };
    }
}