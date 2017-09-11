import {
  Component,
  OnInit
} from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

import { AppState } from '../app.service'
import { UserDetailsModal } from './../modals'
import { UserDetails } from './../shared'
import { UsersService } from '../shared/users.service'

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'home',  // <home></home>
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './home.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './home.component.pug'
})
export class HomeComponent implements OnInit {
  private userDetails: UserDetails

  /**
   * TypeScript public modifiers
   */
  constructor(
    private _users: UsersService,
    private _modal: NgbModal,
    public appState: AppState
  ) {}

  ngOnInit() {
  }

  testModal(): void {
    let userModal = this._modal.open(UserDetailsModal)
    this._users.getUserDetails("648548")
      .take(1)
      .subscribe(
        (res) => {
          console.log(res)
          userModal.componentInstance.user = res
          userModal.componentInstance.name = "World"
        },
        (err) => { console.error(err) }
      )
  }
}
