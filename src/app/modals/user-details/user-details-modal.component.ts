import { Component, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'ang-user-details-modal',
  templateUrl: 'user-details-modal.component.pug'
})

export class UserDetailsModal implements OnInit {
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() { }
}