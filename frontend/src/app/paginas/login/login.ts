import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';
import Swal from 'sweetalert2';

// patron para contraseña
const patronContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  // dependencias para el formulario 
  private readonly fb = inject(FormBuilder); 
  private readonly servicioAuth = inject(AuthService);
  private readonly enrutador = inject(Router);

  //  estados del formulario
  formularioEnviado = signal<boolean>(false);
  cargando = signal<boolean>(false);

  // forms reactive para login
  formulario = this.fb.nonNullable.group({
    usuarioOCorreo: ['', [Validators.required, Validators.minLength(3)]],
    contrasena: ['', [Validators.required, Validators.pattern(patronContrasena)]],
  });

  // envia el formulario
  async enviar(): Promise<void> {
    this.formularioEnviado.set(true);
    
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { usuarioOCorreo, contrasena } = this.formulario.getRawValue();

    try {
      await this.servicioAuth.login(usuarioOCorreo, contrasena);
      
      Swal.fire({
        icon: 'success',
        title: '¡Acceso Concedido!',
        text: 'Redirigiendo a tu feed...',
        timer: 1500,
        showConfirmButton: false,
        background: '#0a0f1e', 
        color: '#fff'
      }).then(() => {
        this.enrutador.navigate(['/publicaciones']);
      });

    } catch (error: any) {
      this.cargando.set(false); 
      
      Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: error.error?.message || 'Credenciales inválidas o servidor inactivo.',
        confirmButtonColor: '#fd1d0d',
        background: '#0a0f1e',
        color: '#fff'
      });
    }
  }

  // verifica si el campo es inválido y si el usuario ha tocado el campo o si el formulario ha sido enviado
  invalido(campo: 'usuarioOCorreo' | 'contrasena'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.formularioEnviado());
  }

  obtenerErrorContrasena(): string {

    if (this.formulario.controls.contrasena.value === '') {
      return 'La contraseña es obligatoria.';
    }

    if (!patronContrasena.test(this.formulario.controls.contrasena.value)) {
      return 'Debe tener al menos 8 caracteres, una mayúscula y un número.';
    }

    return '';
  }
}
