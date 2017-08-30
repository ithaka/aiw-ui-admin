import { Component, OnInit, Input } from '@angular/core'

import { AuthService } from './../shared'

@Component({
  selector: 'ang-main-header',
  templateUrl: 'header.component.pug',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Input() showUserPanel = true

  // holds variables used for translate
  private translateParams: {
    email?: string
  } = {}

  constructor(
    private _auth: AuthService
  ) {
  }

  ngOnInit() {
    this.translateParams.email = this._auth.user.email
  }
}