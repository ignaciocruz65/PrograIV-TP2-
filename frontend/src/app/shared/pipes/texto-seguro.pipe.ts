import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'limpiarTexto', standalone: true })
export class LimpiarTextoPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        return value.replace(/<[^>]*>/g, '');
    }
}