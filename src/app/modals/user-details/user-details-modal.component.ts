import { Component, OnInit, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

import { UserDetails } from '../../shared'

@Component({
  selector: 'ang-user-details-modal',
  templateUrl: 'user-details-modal.component.pug'
})

export class UserDetailsModal implements OnInit {
  @Input() user: UserDetails
  @Input() name: string

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() { }
}