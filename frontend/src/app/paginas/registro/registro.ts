import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import Swal from 'sweetalert2';

// patron de la contraseña
const patronContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(AuthService);
  private readonly enrutador = inject(Router);

  //  estados de la interfaz con Signals
  formularioEnviado = signal<boolean>(false);
  cargando = signal<boolean>(false);
  archivoSeleccionado = signal<File | null>(null);

  // form reactive para registro
  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$'), Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$'), Validators.maxLength(50)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
    password: ['', [Validators.required, Validators.pattern(patronContrasena), Validators.maxLength(20), Validators.minLength(8)]],
    repetirPassword: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(8)]],
    fechaNacimiento: ['', [Validators.required]],
    descripcionBreve: ['', [Validators.required, Validators.maxLength(200)]],
    perfil: ['usuario']
  });

  // seleccionar archivo para registro
  alSeleccionarArchivo(evento: any): void {
    const archivo = evento.target.files[0];
    if (archivo) {
      this.archivoSeleccionado.set(archivo);
    }
  }

  async enviar(): Promise<void> {
    this.formularioEnviado.set(true);
    
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    
    // validacion para saber si contraseña y repetir son las mismas 
    if (valores.password !== valores.repetirPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor, verifica que hayas escrito la misma contraseña en ambos campos.',
        confirmButtonColor: '#fd1d0d',
        background: '#0a0f1e',
        color: '#fff'
      });
      return;
    }

    this.cargando.set(true);

    const formData = new FormData();
    
    Object.keys(valores).forEach(llave => {
      formData.append(llave, (valores as any)[llave]);
    });
    
    const imagen = this.archivoSeleccionado();
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      await this.servicioAuth.registrar(formData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.',
        confirmButtonText: 'Ir al Login',
        confirmButtonColor: '#198754', 
        background: '#0a0f1e',
        color: '#fff'
      }).then(() => {
        this.enrutador.navigate(['/login']);
      });

    } catch (error: any) {
      this.cargando.set(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: error.error?.message || 'El usuario o correo ya existen, o hubo un fallo de conexión.',
        confirmButtonColor: '#dc3545',
        background: '#0a0f1e',
        color: '#fff'
      });
    }
  }
  
  invalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || this.formularioEnviado());
  }

  // 
  obtenerErrorPassword(): string {
    if (this.formulario.controls.password.value === '') {
      return 'La contraseña es obligatoria.';
    }
    
    if (!patronContrasena.test(this.formulario.controls.password.value)) {
      return 'Debe tener al menos 8 caracteres, una mayúscula y un número.';
    }

    return '';
  }
}
