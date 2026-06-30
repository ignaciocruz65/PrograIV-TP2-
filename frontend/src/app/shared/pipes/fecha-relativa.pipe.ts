import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fechaRelativa',
    standalone: true
    })
    export class FechaRelativaPipe implements PipeTransform {
    transform(fecha: Date | string): string {
        if (!fecha) return '';
        
        const now = new Date();
        const date = new Date(fecha);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        
        return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    }
}