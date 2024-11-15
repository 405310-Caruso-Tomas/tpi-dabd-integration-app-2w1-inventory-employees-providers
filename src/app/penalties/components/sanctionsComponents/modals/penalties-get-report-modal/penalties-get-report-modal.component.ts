import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PenaltiesSanctionsServicesService } from '../../../../services/sanctionsService/sanctions.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-penalties-modal-report',
  standalone: true,
  imports: [FormsModule,DatePipe],
  templateUrl: './penalties-get-report-modal.component.html',
  styleUrl: './penalties-get-report-modal.component.scss'
})
export class PenaltiesModalReportComponent implements OnInit{


  data:any;
  formattedDate:any;
  public service = inject(PenaltiesSanctionsServicesService)
  @Input() id:number = 0
  constructor(public activeModal: NgbActiveModal){

  }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    this.getComplaint()
    //alert(this.data.createdDate) 
  }
  close(){
    this.activeModal.close()
  }
  getComplaint(){
    this.service.getById(this.id)
    .subscribe(
      (respuesta) => {
        console.log(respuesta); 
        this.data = respuesta
        console.log(this.data.createdDate)
        this.formattedDate = new Date(this.service.formatDate(this.data.createdDate))
      },
      (error) => {
        console.error('Error:', error);
      });
  }
  

}
