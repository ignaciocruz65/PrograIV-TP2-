import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fechaRelativa',
    standalone: true
    })
    export class FechaRelativaPipe implements PipeTransform {
    transform(fecha: Date | string): string {
        if (!fecha) return '';
        
        const ahora = new Date();
        const fechaPost = new Date(fecha);
        const diferenciaenSegundos = Math.floor((ahora.getTime() - fechaPost.getTime()) / 1000);

        if (diferenciaenSegundos < 60) return 'Hace un momento';
        if (diferenciaenSegundos < 3600) return `Hace ${Math.floor(diferenciaenSegundos / 60)} min`;
        if (diferenciaenSegundos < 86400) return `Hace ${Math.floor(diferenciaenSegundos / 3600)} horas`;
        
        return `Hace ${Math.floor(diferenciaenSegundos / 86400)} días`;
    }
}