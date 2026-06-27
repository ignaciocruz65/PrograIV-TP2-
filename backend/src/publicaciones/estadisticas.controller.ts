import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { AdminGuard } from '../auth/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    ) {}

    @Get('totales')
    async getTotales() {
        const total = await this.publicacionModel.countDocuments();
        return { totales: total };
    }

    @Get('top-likes')
    async getTopLikes() {
    return this.publicacionModel.aggregate([
        { $project: { titulo: 1, cantidadLikes: { $size: "$likes" } } },
        { $sort: { cantidadLikes: -1 } },
        { $limit: 5 }
        ]);
    }
}