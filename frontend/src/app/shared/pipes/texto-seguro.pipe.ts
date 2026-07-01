import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'limpiarTexto', standalone: true })
export class LimpiarTextoPipe implements PipeTransform {
    transform(valor: string): string {
        if (!valor) return '';
        return valor.replace(/<[^>]*>/g, '');
    }
}