import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
selector: '[appModoFocus]',
standalone: true
})
export class ModoFocusDirective {
private esFoco = false;

constructor(private el: ElementRef, private renderer: Renderer2) {
this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.5s ease');
}

@HostListener('click') onClick() {
this.esFoco = !this.esFoco;

if (this.esFoco) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'zIndex', '1000');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.2)');
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'rgba(0,0,0,0.8)');
} else {
    this.renderer.removeStyle(this.el.nativeElement, 'zIndex');
    this.renderer.removeStyle(this.el.nativeElement, 'transform');
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
}
}
}