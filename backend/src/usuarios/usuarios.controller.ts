import { Controller, Get } from '@nestjs/common'
import { UsuariosService } from './usuarios.service'

@Controller('usuarios')
export class UsuariosController {
    constructor (private readonly usuariosService: UsuariosService) {}

    // metodo para listar todos los usuarios
    @Get()
    listar () {
        return this.usuariosService.listar()
    }
}
