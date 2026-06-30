import { Component, ElementRef, ViewChild, signal, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../../../servicios/estadisticas';

Chart.register(...registerables); // Inicializa Chart.js

@Component({
    selector: 'app-dash-estadisticas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dash-estadisticas.html'
    })
    export class DashEstadisticasComponent implements AfterViewInit {
    private estadisticasService = inject(EstadisticasService);

    // por defecto desde el mes pasado hasta hoy
    fechaDesde = signal<string>(this.obtenerFechaHaceUnMes());
    fechaHasta = signal<string>(new Date().toISOString().split('T')[0]);

    @ViewChild('chartUsuarios') chartUsuariosRef!: ElementRef;
    @ViewChild('chartComentarios') chartComentariosRef!: ElementRef;
    @ViewChild('chartPubComentarios') chartPubComentariosRef!: ElementRef;

    private charts: Chart[] = []; 

    ngAfterViewInit() {
        this.cargarEstadisticas();
    }

    cargarEstadisticas() {
        // matamos graficos viejos
        this.charts.forEach(c => c.destroy());
        this.charts = [];

        const desde = this.fechaDesde();
        const hasta = this.fechaHasta();

        // gráfico de barras x usuarios
        this.estadisticasService.getPublicacionesPorUsuario(desde, hasta).subscribe(res => {
        const labels = res.map(item => item._id);
        const data = res.map(item => item.cantidad);
        this.crearGrafico(this.chartUsuariosRef.nativeElement, 'bar', 'Publicaciones', labels, data, '#0d6efd');
        });

        // gráfico de líneas x comentarios
        this.estadisticasService.getComentariosTotales(desde, hasta).subscribe(res => {
        const labels = res.map(item => item._id);
        const data = res.map(item => item.cantidad);
        this.crearGrafico(this.chartComentariosRef.nativeElement, 'line', 'Comentarios por día', labels, data, '#ffc107');
        });

        // gráfico de torta x comentarios
        this.estadisticasService.getComentariosPorPublicacion(desde, hasta).subscribe(res => {
        const labels = res.map(item => `Post: ${item._id}`);
        const data = res.map(item => item.cantidad);
        const colores = ['#ff0055', '#00ffcc', '#ffcc00', '#aa00ff', '#0055ff'];
        this.crearGrafico(this.chartPubComentariosRef.nativeElement, 'pie', 'Comentarios', labels, data, colores);
        });
    }

    private crearGrafico(canvas: any, type: any, label: string, labels: string[], data: number[], bgColors: any) {
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