import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AdminGuard } from '../auth/admin.guard'; 

@Controller('admin/estadisticas')
@UseGuards(AdminGuard) 
export class EstadisticasController {
    constructor(private readonly publicacionesService: PublicacionesService) {}

    @Get('publicaciones-por-usuario')
    async getPostsUsuario(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(new Date(hasta).getTime() + 86400000); 
        
        return this.publicacionesService.getPublicacionesPorUsuario(fechaDesde, fechaHasta);
    }

    @Get('comentarios-totales')
    async getComentariosTotales(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(new Date(hasta).getTime() + 86400000);
        
        return this.publicacionesService.getComentariosTotales(fechaDesde, fechaHasta);
    }

    @Get('comentarios-por-publicacion')
    async getComentariosPost(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        const fechaDesde = new Date(desde);
        const fechaHasta = new Date(new Date(hasta).getTime() + 86400000);
        
        return this.publicacionesService.getComentariosPorPublicacion(fechaDesde, fechaHasta);
    }
}