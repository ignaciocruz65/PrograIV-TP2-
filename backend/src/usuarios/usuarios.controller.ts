import { Controller, Get, Post, Delete, Param, Body,UseGuards } from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import { AdminGuard } from '../auth/admin.guard'
@Controller('usuarios')
@UseGuards(AdminGuard)
export class UsuariosController {
    constructor (private readonly usuariosService: UsuariosService) {}

    // metodo para listar todos los usuarios
    @Get()
    listar () {
        return this.usuariosService.listar()
    }

    @Post('alta')
    crearUsuario(@Body() body: any) {
        return this.usuariosService.crearDesdeAdmin(body);
    }

    @Delete(':id')
    deshabilitarUsuario(@Param('id') id: string) {
        return this.usuariosService.cambiarEstado(id, false);
    }

    @Post(':id/rehabilitar')
    habilitarUsuario(@Param('id') id: string) {
        return this.usuariosService.cambiarEstado(id, true);
    }
}
