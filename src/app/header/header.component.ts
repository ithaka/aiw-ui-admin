import { Component, OnInit, Input } from '@angular/core'
import { Subscription } from 'rxjs/Subscription'

import { AuthService } from './../shared'

@Component({
  selector: 'ang-main-header',
  templateUrl: 'header.component.pug',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Input() showUserPanel = true

  private subscriptions: Subscription[] = []
  private showinactiveUserLogoutModal: boolean = false

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

    // Show inactive user logout modal once the subject is set by auth.service
    this.subscriptions.push(
      this._auth.showUserInactiveModal.subscribe( value => {
        this.showinactiveUserLogoutModal = value
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }
  
  // Reset the idle watcher and navigate to remote login page
  inactiveUsrLogOut(): void{
    this._auth.resetIdleWatcher()
    this.showinactiveUserLogoutModal = false
  }
}