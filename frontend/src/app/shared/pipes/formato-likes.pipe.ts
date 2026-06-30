import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatoLikes', standalone: true })
export class FormatoLikesPipe implements PipeTransform {
    transform(value: number): string {
        if (value < 1000) return value.toString();
        return (value / 1000).toFixed(1) + 'k';
    }
}