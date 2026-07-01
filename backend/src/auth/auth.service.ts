import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  // inicalizacion de variables supabase para acceder a los servicios de supabase
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService
  ) {}  
  
  // metodo para registrar un usuario
  async registrar(registroDto: RegistroDto, imagen?: any) {
    if (registroDto.password !== registroDto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(registroDto.password)) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    }

    const existeUsuario = await this.usuariosService.existeCorreoOCuenta(registroDto.correo, registroDto.nombreUsuario);
    if (existeUsuario) {
      throw new ConflictException('El correo o nombre de usuario ya está en uso');
    }

    let urlImagen: string | null = null;
    if (imagen) {
      urlImagen = await this.guardarImagenPerfil(imagen);
    }

    const passwordHash = crypto.createHash('sha256').update(registroDto.password).digest('hex');

    const nuevoUsuario = await this.usuariosService.crear({
      nombre: registroDto.nombre,
      apellido: registroDto.apellido,
      correo: registroDto.correo,
      nombreUsuario: registroDto.nombreUsuario,
      passwordHash: passwordHash,
      fechaNacimiento: registroDto.fechaNacimiento,
      descripcionBreve: registroDto.descripcionBreve,
      perfil: registroDto.perfil || 'usuario',
      imagenPerfilUrl: urlImagen 
    });

    const payload = { 
      sub: nuevoUsuario.id,
      correo: nuevoUsuario.correo, 
      perfil: nuevoUsuario.perfil 
    };

    return {
      usuario: nuevoUsuario,
      token: await this.jwtService.signAsync(payload)
    };
  }
  
  // metodo para hacer login de un usuario
  async login(loginDto: LoginDto) {
    
    const usuario = await this.usuariosService.buscarPorCorreoOCuenta(loginDto.usuarioOCorreo);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    //chequeo si esta deshabilitado
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta ha sido deshabilitada por un administrador.');
    }

    const hashLogin = crypto.createHash('sha256').update(loginDto.password).digest('hex');
    if (usuario.passwordHash !== hashLogin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const usuarioSeguro = this.usuariosService.quitarContrasena(usuario);
    const payload = { 
      sub: usuarioSeguro.id,
      correo: usuarioSeguro.correo, 
      perfil: usuarioSeguro.perfil 
    };

    return {
      usuario: usuarioSeguro,
      token: await this.jwtService.signAsync(payload)
    };
  }


  // metodo para guardar una imagen de perfil en la nube
  private async guardarImagenPerfil(imagen: any): Promise<string> {
    const extension = imagen.originalname.split('.').pop() || 'jpg';
    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

    const { data, error } = await this.supabase.storage
      .from('perfiles') 
      .upload(nombreArchivo, imagen.buffer, {
        contentType: imagen.mimetype || 'image/jpeg',
      });

    if (error) {
      console.error(error);
      throw new BadRequestException('Hubo un error al subir la imagen a la nube');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('perfiles')
      .getPublicUrl(nombreArchivo);

    return publicUrlData.publicUrl;
  }


  async autorizar(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload || !payload.correo) throw new Error('Token corrupto');

      const usuario = await this.usuariosService.buscarPorCorreoOCuenta(payload.correo);
      if (!usuario || !usuario.activo) {
        throw new Error('Usuario inexistente o inactivo');
      }

      return { usuario: this.usuariosService.quitarContrasena(usuario) };
    } catch (error) {
      throw new UnauthorizedException('Tu sesión expiró o el token es inválido.');
    }
  }

  async actualizar(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      delete payload.exp;
      delete payload.iat;
      
      // nuevo token +15 min
      return { token: await this.jwtService.signAsync(payload) };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async refrescarToken(tokenViejo: string) {
    try {
      const payload = await this.jwtService.verifyAsync(tokenViejo);
      
      const { exp, iat, ...payloadLimpio } = payload;
      //firma
      const tokenNuevo = await this.jwtService.signAsync(payloadLimpio);
      return { token: tokenNuevo };
      
    } catch (error) {
      throw new UnauthorizedException('No se pudo refrescar el token');
    }
  }
}