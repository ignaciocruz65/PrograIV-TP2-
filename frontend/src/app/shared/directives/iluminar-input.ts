import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
    selector: '[appIluminarInput]',
    standalone: true
    })
    export class IluminarInputDirective {
    constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('focus') onFocus() {
    this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #00ffcc');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 8px #00ffcc');
    }

    @HostListener('blur') onBlur() {
    this.renderer.removeStyle(this.el.nativeElement, 'border');
    this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
    }
}