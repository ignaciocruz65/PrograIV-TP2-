import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { UsuariosService } from '../../../servicios/usuarios'
import Swal from 'sweetalert2'
import { Router } from '@angular/router'
import { AuthService } from '../../../servicios/auth'

@Component({
  selector: 'app-dash-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dash-usuarios.html'
})
export class DashUsuariosComponent implements OnInit {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private servicioAuth = inject(AuthService)
  private servicioUsuarios = inject(UsuariosService)

  usuarios = signal<any[]>([])
  cargando = signal<boolean>(false)
  formUsuario!: FormGroup

  ngOnInit () {
    this.iniciarFormulario()
    if (!this.servicioAuth.estaLogueado() || this.servicioAuth.usuarioActual()?.perfil !== 'administrador') {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarUsuarios()
  }

  
  iniciarFormulario () {
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fechaNacimiento: ['', Validators.required],
      descripcionBreve: ['', Validators.required],
      perfil: ['usuario', Validators.required]
    })
  }

  cargarUsuarios () {
    this.cargando.set(true)
    this.servicioUsuarios.listar().subscribe({
      next: data => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },

      error: () => Swal.fire('Error', 'No se pudo cargar la lista', 'error')
    })
  }

  cambiarEstado (usuario: any) {
    const peticion = usuario.activo
      ? this.servicioUsuarios.deshabilitar(usuario.id)
      : this.servicioUsuarios.habilitar(usuario.id)

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', `Usuario ${usuario.activo ? 'deshabilitado' : 'habilitado'}`, 'success')
        this.cargarUsuarios()
      },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    })
  }

  crear () {
    this.formUsuario.markAllAsTouched();
    if (this.formUsuario.invalid) return

    this.cargando.set(true);
    const { repetirPassword, ...datosUsuario } = this.formUsuario.value;
    this.servicioUsuarios.crear(datosUsuario).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        this.cargarUsuarios();
        this.formUsuario.reset({ perfil: 'usuario' });
        this.cargando.set(false);
      },
      error: err => {
        const mensaje = err.error?.message || 'No se pudo crear el usuario';
        Swal.fire('Error', mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }
  campoInvalido(nombreCampo: string) {
    return this.formUsuario.get(nombreCampo)?.invalid && this.formUsuario.get(nombreCampo)?.touched;
  }
}

