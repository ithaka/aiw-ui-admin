import {
  Component,
  OnInit
} from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

import { AppState } from '../app.service'
import { UserDetailsModal } from './../modals'
import { UserDetails } from './../shared'
import { UsersService, InstitutionStatsResponse } from '../shared/users.service'

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
  private instStats: InstitutionStatsResponse

  /**
   * TypeScript public modifiers
   */
  constructor(
    private _users: UsersService,
    private _modal: NgbModal,
    public appState: AppState
  ) {}

  ngOnInit() {
    this.loadInstStats();
  }

  private loadInstStats(): void{
    this._users.getInstitutionStats().subscribe( res => {
      if(res){
        this.instStats = res
        console.log(this.instStats)
      }
    })
  }
}
