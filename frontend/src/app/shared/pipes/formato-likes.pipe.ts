import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatoLikes', standalone: true })
export class FormatoLikesPipe implements PipeTransform {
    transform(valor: number): string {
        if (valor < 1000) return valor.toString();
        return (valor / 1000).toFixed(1) + 'k';
    }
}