import { Component, ElementRef, ViewChild, signal, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../../../servicios/estadisticas';

Chart.register(...registerables);

@Component({
    selector: 'app-dash-estadisticas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dash-estadisticas.html'
    })
    export class DashEstadisticasComponent implements AfterViewInit {
    private estadisticasService = inject(EstadisticasService);
    private cargado = false

    // por defecto desde el mes pasado hasta hoy
    fechaDesde = signal<string>(this.obtenerFechaHaceUnMes());
    fechaHasta = signal<string>(new Date().toISOString().split('T')[0]);

    @ViewChild('chartUsuarios') chartUsuariosRef!: ElementRef;
    @ViewChild('chartComentarios') chartComentariosRef!: ElementRef;
    @ViewChild('chartPubComentarios') chartPubComentariosRef!: ElementRef;

    private charts: Chart[] = []; 

    ngAfterViewInit() {
        setTimeout(() => { // Esperamos 200ms para asegurar que el DOM está listo
        this.cargarEstadisticas();
        }, 200);
    }

    cargarEstadisticas() {
        // matamos graficos viejos
        this.charts.forEach(c => c.destroy());
        this.charts = [];

        const desde = this.fechaDesde();
        const hasta = this.fechaHasta();

        // gráfico de barras x usuarios
        this.estadisticasService.getPublicacionesPorUsuario(desde, hasta).subscribe({
            next: (res) => {
                const labels = res.map(item => item._id);
                const data = res.map(item => item.cantidad);
                this.crearGrafico(this.chartUsuariosRef.nativeElement, 'bar', 'Publicaciones', labels, data, '#0d6efd');
            },
            error: (err) => console.error('Error al cargar publicaciones por usuario:', err)
        });

        // gráfico de líneas x comentarios
        this.estadisticasService.getComentariosTotales(desde, hasta).subscribe({
            next: (res) => {
                const labels = res.map(item => item._id);
                const data = res.map(item => item.cantidad);
                this.crearGrafico(this.chartComentariosRef.nativeElement, 'line', 'Comentarios por día', labels, data, '#ffc107');
            },
            error: (err) => console.error('Error al cargar comentarios totales:', err)
        });

        // gráfico de torta x comentarios
        this.estadisticasService.getComentariosPorPublicacion(desde, hasta).subscribe({
            next: (res) => {
                const labels = res.map(item => `Post: ${item.titulo}`);
                const data = res.map(item => item.cantidad);
                const colores = ['#ff0055', '#00ffcc', '#ffcc00', '#aa00ff', '#0055ff'];
                this.crearGrafico(this.chartPubComentariosRef.nativeElement, 'pie', 'Comentarios', labels, data, colores);
            },
            error: (err) => console.error('Error al cargar top publicaciones:', err)
        });

        
    }

    private crearGrafico(canvas: any, type: any, label: string, labels: string[], data: number[], bgColors: any) {
        if (!labels || labels.length === 0 || !data || data.length === 0) return;
        Chart.defaults.color = '#fff'; 
        
        const nuevoChart = new Chart(canvas, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
            label: label,
            data: data,
            backgroundColor: bgColors,
            borderColor: bgColors,
            borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
        });
        this.charts.push(nuevoChart);
    }

    private obtenerFechaHaceUnMes(): string {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    }
}