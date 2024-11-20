import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { Router, RouterModule } from '@angular/router';
import { iepBackButtonComponent } from '../../../common-components/iep-back-button/iep-back-button.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, max, switchMap } from 'rxjs';

@Component({
  selector: 'app-iep-suppliers-form',
  standalone: true,
  imports: [
    iepBackButtonComponent,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './iep-suppliers-form.component.html',
  styleUrl: './iep-suppliers-form.component.css',
})
export class IepSuppliersFormComponent {
  proveedorForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private supplierService: SuppliersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', [Validators.required, validarCUIT()]], 
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      supplierType: ['OTHER', Validators.required],
      address: ['', Validators.required],
      discontinued: [false],
    });

    this.checkCuit();
    this.checkEmail();
    this.chechName();
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;
      console.log(formData);
      this.supplierService.createSupplier(formData).subscribe((response) => {
        this.proveedorForm.reset();
        this.router.navigate(['/suppliers']);
      });

      const formAccess = {
        name: formData.name,
        cuil: formData.cuit,
        email: formData.email,
      };

      this.supplierService.createSupplierAccess(formAccess).subscribe({
        next: (response) => {
          console.log(JSON.stringify(response));
          Swal.fire({
            title: '¡Guardado!',
            text: 'Proveedor guardado con exito',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.router.navigate(['/suppliers']);
          });
          console.log('PASO: ', response);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Error en el servidor intente nuevamente mas tarde',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
          });

          console.log('error:' + error.error.message);
          console.error(error);
        },
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }
  goBack() {
    window.history.back();
  }

  cuitExists: boolean = false;
  checkCuit() {
    this.proveedorForm
      .get('cuit')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((cuit) => {
          this.cuitExists = false;
          return this.supplierService.getSupplierByCuit(cuit);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.cuitExists = exists;
          const cuitControl = this.proveedorForm.get('cuit');
          if (exists) {
            cuitControl?.setErrors({ cuitExists: true });
          } 
        },
        (error) => {
          console.error('Error al verificar el CUIT', error);
        }
      );
  }

  /* isValidCuilFinish: boolean = false;

  validarCUITFormato(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
  
      const cuit = control.value.toString().trim();
      
      // Validar ÚNICAMENTE el formato con guiones (XX-XXXXXXXX-X)
      const formatoConGuiones = /^\d{2}-\d{8}-\d{1}$/;
      
      if (!formatoConGuiones.test(cuit)) {
        return {
          invalidCUIT: 'El formato debe ser XX-XXXXXXXX-X (incluyendo los guiones)'
        };
      }
  
      // Eliminar guiones para la validación del dígito verificador
      const cuitLimpio = cuit.replace(/-/g, '');
      
      // Validar tipo de CUIT
      const tipo = parseInt(cuitLimpio.substring(0, 2), 10);
      const tiposValidos = [20, 23, 24, 27, 30, 33, 34];
      if (!tiposValidos.includes(tipo)) {
        return {
          invalidCUIT: 'El tipo de CUIT no es válido (debe comenzar con: 20, 23, 24, 27, 30, 33 o 34)'
        };
      }
  
      // Validar dígito verificador
      const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
      const digitoVerificador = parseInt(cuitLimpio.charAt(10), 10);
  
      let suma = 0;
      for (let i = 0; i < 10; i++) {
        suma += parseInt(cuitLimpio.charAt(i), 10) * multiplicadores[i];
      }
  
      let resto = suma % 11;
      let digitoCalculado = resto === 0 ? 0 : 11 - resto;
  
      if (digitoCalculado !== digitoVerificador) {
        return {
          invalidCUIT: 'El dígito verificador no es válido'
        };
      }
  
      return null;
    };
  }
    */

  emailExists: boolean = false;

  checkEmail() {
    this.proveedorForm
      .get('email')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email) => {
          this.emailExists = false;
          return this.supplierService.getSupplierByEmail(email);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.emailExists = exists;
          const emailControl = this.proveedorForm.get('email');
          if (exists) {
            emailControl?.setErrors({ emailExists: true });
          } 
        },
        (error) => {
          console.error('Error al verificar el Email', error);
        }
      );
  }

  nameExists: boolean = false;
  chechName() {
    this.proveedorForm
      .get('name')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((name) => {
          this.nameExists = false;
          return this.supplierService.getSupplierByName(name);
        })
      )
      .subscribe(
        (exists: boolean) => {
          this.nameExists = exists;
          const nameControl = this.proveedorForm.get('name');

          if (exists) {
            nameControl?.setErrors({ nameExists: true });
          } else {
            nameControl?.setErrors(null);
          }
        },
        (error) => {
          console.error('Error al verificar el Nombre', error);
        }
      );
  }
}

function validarCUIT(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value) {
      // Elimina guiones o espacios del CUIT
      const cuilLimpio = control.value.replace(/[-\s]/g, "");

      // Verifica que tenga exactamente 11 dígitos
      if (!/^\d{11}$/.test(cuilLimpio)) {
        return { cuilInvalido: true };
      }

      // Verifica que los primeros 2 dígitos sean un tipo válido (20, 23, 24, 27, 30, 33, 34)
      const tipo = parseInt(cuilLimpio.substring(0, 2), 10);
      console.log(tipo);
      const tiposValidos = [ 30, 33, 34];

      if (!tiposValidos.includes(tipo)) {
        console.log("no es valido")
        return { cuilInvalido: true };
      }

      // Calcula el dígito verificador
      const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]; // Coeficientes para el cálculo
      let suma = 0;

      for (let i = 0; i < multiplicadores.length; i++) {
        suma += parseInt(cuilLimpio[i], 10) * multiplicadores[i];
      }

      const resto = suma % 11;
      const digitoCalculado = resto === 0 ? 0 : 11 - resto;
      const digitoVerificador = parseInt(cuilLimpio[10], 10);

      // Verifica si el dígito verificador es correcto
      if (digitoCalculado !== digitoVerificador) {
        return { cuilInvalido: true };
      }
    }

    return null; 
  };
}
