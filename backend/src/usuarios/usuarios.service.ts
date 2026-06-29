import { Injectable,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Usuario } from './usuario.shema';
import { UsuarioPublico } from './usuarios.types';
import * as crypto from 'crypto';
@Injectable()
export class UsuariosService {
    // inyeccion de el modelo de usuario de usuario.shema
    constructor(
        @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>
    ) {}

    async crearDesdeAdmin(datos: any): Promise<UsuarioPublico> {
        if (!datos.nombre || !datos.apellido || !datos.correo || !datos.nombreUsuario || !datos.password || !datos.fechaNacimiento) {
            throw new BadRequestException('Faltan campos obligatorios');
        }
        const existe = await this.existeCorreoOCuenta(datos.correo, datos.nombreUsuario);
        if (existe) throw new BadRequestException('El correo o nombre de usuario ya existen');

        const passwordHash = crypto.createHash('sha256').update(datos.password).digest('hex');
        const usuarioCreado = await this.usuarioModel.create({
            nombre: datos.nombre,
            apellido: datos.apellido,
            correo: datos.correo.toLowerCase(), 
            nombreUsuario: datos.nombreUsuario.toLowerCase(),
            passwordHash,
            fechaNacimiento: datos.fechaNacimiento,
            descripcionBreve: datos.descripcionBreve || '',
            perfil: datos.perfil || 'usuario',
            imagenPerfilUrl: datos.imagenPerfilUrl || null,
            activo: true 
        });
        return this.quitarContrasena(usuarioCreado.toObject());
    }

    async cambiarEstado(id: string, estado: boolean): Promise<UsuarioPublico> {
        const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(
            id, 
            { activo: estado }, 
            { new: true }
        ).lean();
        return this.quitarContrasena(usuarioActualizado);
    }


    

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

        return !!usuarioExistente; 
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
            activo: usuario.activo,
            imagenPerfilUrl: usuario.imagenPerfilUrl,
            createdAt: usuario.createdAt
        };
    }
}