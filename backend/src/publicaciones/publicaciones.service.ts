import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

@Injectable()
export class PublicacionesService {
  private readonly supabase: SupabaseClient;

  constructor(
    @InjectModel('Publicacion') private readonly publicacionModel: Model<Publicacion>
  ) {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  }

  async crear(datos: any, imagen?: any): Promise<Publicacion> {
    let urlImagen: string | null = null;
    if (imagen) {
      urlImagen = await this.guardarImagenPublicacion(imagen);
    }

    return this.publicacionModel.create({
      ...datos,
      imagenUrl: urlImagen
    });
  }

  async listar(limite: number = 10, salto: number = 0, ordenarPor: string = 'fecha', usuarioIdFiltro?: string): Promise<any[]> {
    const filtro: any = { activo: true };
    if (usuarioIdFiltro) {
      filtro.usuarioId = usuarioIdFiltro;
    }

    const orden: any = ordenarPor === 'likes' ? { likes: -1 } : { createdAt: -1 };

    // buscamos las publicaciones
      const posteos = await this.publicacionModel.find(filtro)
      .sort(orden)
      .skip(salto)
      .limit(limite)
      .lean();

    return posteos.map((post: any) => ({
      ...post,
      id: post._id.toString() 
    }));
  }

  async darDeBaja(idPublicacion: string, usuarioIdSolicitante: string, perfilSolicitante: string): Promise<void> {
    const publicacion = await this.publicacionModel.findById(idPublicacion);
    if (!publicacion || !publicacion.activo) {
      throw new BadRequestException('La publicación no existe');
    }

    if (publicacion.usuarioId !== usuarioIdSolicitante && perfilSolicitante !== 'administrador') {
      throw new UnauthorizedException('No tienes permiso para borrar esta publicación');
    }

    await this.publicacionModel.findByIdAndUpdate(idPublicacion, { activo: false });
  }

  async agregarLike(idPublicacion: string, usuarioId: string): Promise<void> {
    await this.publicacionModel.findByIdAndUpdate(idPublicacion, {
      $addToSet: { likes: usuarioId }
    });
  }

  async quitarLike(idPublicacion: string, usuarioId: string): Promise<void> {
    await this.publicacionModel.findByIdAndUpdate(idPublicacion, {
      $pull: { likes: usuarioId }
    });
  }

  async agregarComentario(idPublicacion: string, nombreUsuario: string, texto: string): Promise<void> {
    
    const nuevoComentario = {
      id: crypto.randomUUID(), 
      nombreUsuario,
      texto,
      fecha: new Date(),
      modificado: false
    };
    
    await this.publicacionModel.findByIdAndUpdate(idPublicacion, {
      $push: { comentarios: nuevoComentario }
    });
  }
  async modificarComentario(idPublicacion: string, idComentario: string, textoNuevo: string): Promise<void> {
    await this.publicacionModel.findOneAndUpdate(
      { _id: idPublicacion, "comentarios.id": idComentario }, // Busca el post y el comentario exacto
      {
        $set: {
          "comentarios.$.texto": textoNuevo,      // El símbolo $ significa "el comentario que encontraste arriba"
          "comentarios.$.modificado": true
        }
      }
    );
  }

  
  async listarComentarios(idPublicacion: string, limite: number = 10, salto: number = 0): Promise<any[]> {
    const publicacion = await this.publicacionModel.findById(idPublicacion).lean();
    if (!publicacion) throw new BadRequestException('La publicación no existe');

    let comentarios = publicacion.comentarios || [];

    // Ordenamos: los más recientes primero (de mayor a menor fecha)
    comentarios.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    // Paginamos cortando el array
    return comentarios.slice(salto, salto + limite);
  }


  private async guardarImagenPublicacion(imagen: any): Promise<string> {
    const extension = imagen.originalname.split('.').pop() || 'jpg';
    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

    const { error, data } = await this.supabase.storage
      .from('publicacionesimgs') 
      .upload(nombreArchivo, imagen.buffer, { contentType: imagen.mimetype });

    if (error) throw new BadRequestException('Error al subir imagen');

    const { data: urlData } = this.supabase.storage.from('publicacionesimgs').getPublicUrl(nombreArchivo);
    return urlData.publicUrl;
  }
}