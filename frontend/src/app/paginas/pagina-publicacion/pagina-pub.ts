import { Component, inject, OnInit, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { AuthService } from '../../servicios/auth'
import { CommonModule } from '@angular/common'
import Swal from 'sweetalert2'
@Component({
    selector: 'app-pagina-pub',
    standalone: true,
    imports: [RouterLink, CommonModule],
    templateUrl: './pagina-pub.html'
})
export class PaginaPublicacionComponent implements OnInit {
    private http = inject(HttpClient)
    private route = inject(ActivatedRoute)
    private authService = inject(AuthService)
    private apiUrl = 'https://progra-iv-tp-2-six.vercel.app/publicaciones'    

    post = signal<any>(null)
    comentarios = signal<any[]>([])
    miUsuario: string = ''
    
    // paginado
    limite = 5
    salto = 0
    hayMasComentarios = true 

    ngOnInit () {
        const usuario = this.authService.usuarioActual()
        if (usuario) {
            this.miUsuario = usuario.nombreUsuario
        }

        const id = this.route.snapshot.paramMap.get('id')
        if (id) {
            this.cargarPostUnico(id)
            this.cargarComentarios()
        }

    }

    // post principal
    cargarPostUnico(id: string) {
        
        this.http.get<any[]>(`${this.apiUrl}?limit=100&offset=0`).subscribe({
            next: (posteos) => {
                this.post.set(posteos.find(p => String(p.id) === String(id) || String(p._id) === String(id)));
            },
            error: (err) => console.log('Error', err)
        });
    }

    cargarComentarios () {
        const id = this.route.snapshot.paramMap.get('id')
        const url = `${this.apiUrl}/${id}/comentarios?limit=${this.limite}&offset=${this.salto}`

        this.http.get<any[]>(url).subscribe({
            next: (nuevos) => {
                this.comentarios.set([...this.comentarios(), ...nuevos])
                this.hayMasComentarios = nuevos.length === this.limite
            },
            error: (err) => console.log('Error al cargar los comentarios', err)
        })
    }

    cargarMasBoton () {
        this.salto += this.limite
        this.cargarComentarios()
    }

    escribirComentario (texto: string) {
        if (!this.post || !texto.trim()) return 

        const usuario = this.authService.usuarioActual()
        if (!usuario) return

        const id = this.post().id
        const nombre = usuario.nombreUsuario

        this.http
        .post(`${this.apiUrl}/${id}/comentarios`, { nombreUsuario: nombre, texto })
        .subscribe({
            next: () => {
                this.comentarios.set([])
                this.salto = 0
                this.cargarComentarios()
            },
            error: (err) => console.log('Error al publicar el comentario', err)
        })
    }

    editarComentario (comentarioId: string, textoViejo: string) {
        Swal.fire({
        input: 'text',
        inputValue: textoViejo,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar'
        }).then(resultado => {
        if (resultado.isConfirmed) {
            const idPub = this.post().id

            this.http
            .put(`${this.apiUrl}/${idPub}/comentarios/${comentarioId}`, { texto: resultado.value })
            .subscribe({
                next: () => {
                    this.comentarios.set([])
                    this.salto = 0
                    this.cargarComentarios()
                },
                error: (err) => console.log('Error al editar el comentario', err)
            })
        }
        })
    }
}