import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';

@Controller('publicaciones')
export class PublicacionesController {
    constructor (private readonly publicacionesService: PublicacionesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen'))
    crear (@Body() dto: CrearPublicacionDto, @UploadedFile() imagen?: any) {
        return this.publicacionesService.crear(dto, imagen);
    }

    @Get()
    listar (
        @Query('limit') limit: string,
        @Query('offset') offset: string,
        @Query('sort') sort: string,
        @Query('usuarioId') usuarioId?: string,
    ) {
        const limite = limit ? parseInt(limit, 10) : 10;
        const salto = offset ? parseInt(offset, 10) : 0;
        return this.publicacionesService.listar(limite, salto, sort, usuarioId);
    }

    @Delete(':id')
    darDeBaja (
        @Param('id') idPublicacion: string,
        @Body('usuarioId') usuarioId: string,
        @Body('perfil') perfil: string, 
    ) {
        return this.publicacionesService.darDeBaja(idPublicacion, usuarioId, perfil);
    }

    @Post(':id/like')
    darLike (@Param('id') idPublicacion: string, @Body('usuarioId') usuarioId: string) {
        return this.publicacionesService.agregarLike(idPublicacion, usuarioId);
    }

    @Post(':id/comentarios')
    comentar(@Param('id') id: string, @Body('nombreUsuario') nombreUsuario: string, @Body('texto') texto: string) {
        return this.publicacionesService.agregarComentario(id, nombreUsuario, texto);
    }
    
    @Delete(':id/like')
    quitarLike (@Param('id') idPublicacion: string, @Body('usuarioId') usuarioId: string) {
        return this.publicacionesService.quitarLike(idPublicacion, usuarioId);
    }
}