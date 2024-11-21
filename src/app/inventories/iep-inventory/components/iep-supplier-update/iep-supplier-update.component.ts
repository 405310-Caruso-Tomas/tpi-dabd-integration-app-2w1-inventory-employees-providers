import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/suppliers';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../users/users-servicies/auth.service';

@Component({
  selector: 'app-iep-supplier-update',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './iep-supplier-update.component.html',
  styleUrl: './iep-supplier-update.component.css'
})
export class IepSupplierUpdateComponent implements OnInit{

  proveedorForm!: FormGroup;
  id:number=0;


  onSubmit() {
    if (this.proveedorForm.valid && this.validateNonEquals()) {
      const supplierUpdate: Supplier = {
        id: this.id, 
        name: this.proveedorForm.value.name,
        cuit: this.proveedorForm.value.cuit,
        address: this.proveedorForm.value.address,
        supplierType: this.proveedorForm.value.supplierType, 
        description: this.proveedorForm.value.description,
        phoneNumber: this.proveedorForm.value.phoneNumber,
        email: this.proveedorForm.value.email,
        discontinued: this.proveedorForm.value.discontinued
      };
  
      this.supplierService.updateSupplier(supplierUpdate,this.userService.getUser().id).subscribe(
          {
        next: response=> {
          console.log(JSON.stringify(response))
          Swal.fire({
            title: '¡Guardado!',
            text: "Proveedor actualizado con exito",
            icon: 'success',
            confirmButtonText: 'Aceptar',
            showCancelButton: false,
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/main/providers/suppliers'])
          });
          console.log("PASO: ", response);
        },
        error: error => {
          
          Swal.fire({
            title: 'Error',
            text: "'Error al actualizar el proveedor'",
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6'
          });
       
          console.log("error:"+error.error.message)
          console.error(error);
                 
        }
      }
      );
    }
  }


  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    if (email && email.endsWith('.com') || email.endsWith('.com.ar') || email.endsWith('.net') || 
    email.endsWith('.mx') || email.endsWith('.org') || email.endsWith('.gov') || email.endsWith('.edu')) {
      return null; 
    } else {
      return { emailDomain: true }; 
    }
  }

  validateNonEquals():boolean{
    if(this.supplierUpdateOrig?.name==this.proveedorForm.value.name &&
      this.supplierUpdateOrig?.cuit==this.proveedorForm.value.cuit &&
      this.supplierUpdateOrig?.address==this.proveedorForm.value.address &&
      this.supplierUpdateOrig?.supplierType==this.proveedorForm.value.supplierType &&
      this.supplierUpdateOrig?.description==this.proveedorForm.value.description &&
      this.supplierUpdateOrig?.phoneNumber==this.proveedorForm.value.phoneNumber &&
      this.supplierUpdateOrig?.email==this.proveedorForm.value.email &&
      this.supplierUpdateOrig?.discontinued==this.proveedorForm.value.discontinued){
        this.proveedorForm.invalid;
        Swal.fire({
          title: 'Error',
          text: "No se realizaron cambios",
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
        return false;
      }
      return true;
  }


  
 

  supplierUpdate?:Supplier;
  supplierUpdateOrig?:Supplier;

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      name: ['', Validators.required],
      cuit: ['', Validators.required],
      phoneNumber: ['', [Validators.required,Validators.pattern('^[1-9]{10}$')]],
      email: ['', [Validators.required, Validators.email,this.emailDomainValidator]],
      supplierType: ['', Validators.required],
      address: ['', Validators.required],
      createdUser: [0],
      authorized: [false],
      discontinued:[false]
    });

    
    this.searchSupplier();
  }
  
  searchSupplier() {
    this.id = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.supplierService.getSupplierById(this.id)
        .subscribe(
          supplier => {
            this.supplierUpdate = supplier;
            this.supplierUpdateOrig = supplier;
            this.proveedorForm.patchValue({
              name: supplier.name,
              cuit: supplier.cuit,
              phoneNumber: supplier.phoneNumber,
              email: supplier.email,
              supplierType: supplier.supplierType,
              address: supplier.address,
              authorized: supplier.authorized,
              discontinued:supplier.discontinued
            });
          },
          error => console.error('Error al obtener el proveedor', error)
        );
    } else {
      console.error('ID no válido');
    }
  }
  


  isFieldInvalid(field: string): boolean {
    const control = this.proveedorForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
  
constructor(private activateRoute:ActivatedRoute,private supplierService:SuppliersService,private fb: FormBuilder,private router:Router,private userService : AuthService){}

}