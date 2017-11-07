import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common'

import { AuthService, UserDetails, UsersService, UserUpdate } from '../../shared'

@Component({
  selector: 'ang-user-details-modal',
  templateUrl: 'user-details-modal.component.pug',
  styleUrls: ['./user-details-modal.component.scss']
})

export class UserDetailsModal implements OnInit {
  @Input() user: UserDetails
  @Input() name: string

  private permissionsForm: FormGroup
  private messages: {
    userNotFoundError?: boolean,
    userServiceError?: boolean,
    archiveError?: boolean,
    archiveSuccess?: boolean,
    unarchiveSuccess?: boolean,
    permissionsError?: boolean,
    permissionsSuccess?: boolean,
    extendAccessError?: boolean,
    extendAccessSuccess?: boolean
  } = {}
  private submitted: boolean

  // set on init, determins whether or not the ss options should be displayed
  private ssEnabled: boolean = false

  constructor(
    private activeModal: NgbActiveModal,
    private _users: UsersService,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _date: DatePipe,
    _fb: FormBuilder
  ) {
    this.permissionsForm = _fb.group({
      ssEnabled: null,
      optInEmail: null,
      optInSurvey: null,
      ssAdmin: null,
      hasAdminPriv: null
    })
  }

  ngOnInit() {
    this._users.getUserDetails(this.route.snapshot.queryParams.user) // yes this profileId has a lowercase 'i'
      .take(1)
      .subscribe(
        (user) => {
          // inject the received user into the component's Input
          this.user = user
          this.setUserPermissions(user)
        },
        (err) => {
          console.error(err)
          if (err.status == 404) {
            this.messages.userNotFoundError = true
          } else {
            this.messages.userServiceError = true
          }
        }
      )
    this._auth.getInstitution().take(1).subscribe(
      (res) => {
        this.ssEnabled = res.institution.ss_enabled === "1"
      }, (err) => {
        console.error(err)
      }
    )
  }

  /**
   * Sets the initial values for the user permissions form
   */
  private setUserPermissions(user: UserDetails): void {
    this.permissionsForm.controls['ssEnabled'].setValue(user.ssEnabled)
    this.permissionsForm.controls['optInEmail'].setValue(user.optInEmail)
    this.permissionsForm.controls['optInSurvey'].setValue(user.optInSurvey)
    this.permissionsForm.controls['ssAdmin'].setValue(user.ssAdmin)
    this.permissionsForm.controls['hasAdminPriv'].setValue(user.hasAdminPriv)
  }

  private onSubmit(update: UserUpdate) {
    // reset all service messages
    this.messages = {}
    // tell the form that it's submitted
    this.submitted = true

    // the update object requires a user id in order to send it
    update.profileId = this.user.profileId
    if (this.permissionsForm.invalid) {
      return
    }

    this._users.updateUser(update)
      .take(1)
      .subscribe((res) => {
        this.messages.permissionsSuccess = true

        // Contruct & push the updated user object to users observable
        let updatedUser = {
          'active': !res.archivedUser,
          'status': !res.archivedUser ? 'Active' : 'Archive',
          'createdate': this._date.transform( res.createdDate.replace(' ', 'T') ),
          'email': res.user,
          'profileid': res.profileId,
          'ssenabled': res.ssEnabled,
          'ssValue': res.ssEnabled ? '<img src="/assets/img/checkMark.gif" class="tickIcon">' : '',
          'timelastaccessed': this._date.transform( res.timeLastAccessed.replace(' ', 'T') )
        }

        this._users.updatedUser.next( updatedUser )
      }, (err) => {
        console.error(err)
        this.messages.permissionsError = true
      })
  }

  /**
   * Makes the call to the service to archive the user and handles updating the ui accordingly
   */
  private archiveUser(): void {
    this.messages = {}
    this._users.archiveUser(this.user.profileId, !this.user.archivedUser)
      .take(1)
      .subscribe((res) => {
        console.log(res)

        this.user.archivedUser = !this.user.archivedUser
        
        this.messages.archiveSuccess = this.user.archivedUser
        this.messages.unarchiveSuccess = !this.user.archivedUser

        // Contruct & push the updated user object to users observable
        let updatedUser = {
          'active': res.active,
          'status': res.active ? 'Active' : 'Archive',
          'userid': res.userId,
          'profileid': res.profileId,
          'ssenabled': res.ssEnabled,
          'ssValue': res.ssEnabled ? '<img src="/assets/img/checkMark.gif" class="tickIcon">' : '',
          'timelastaccessed': this._date.transform( res.timeLastAccessed.replace(' ', 'T') )
        }

        this._users.updatedUser.next( updatedUser )
      }, (err) => {
        console.error(err)
        this.messages.archiveError = true
      })
  }

  /**
   * Extend a user's access by 30 days once per call
   */
  private extendUserAccess(): void {
    this.messages = {}

    let daysRemaining: number = this.user.daysAccessRemaining
    let updatedDaysRemaining: number = daysRemaining > 0 ? daysRemaining += 30 : 30

    this._users.updateUser({ profileId: this.user.profileId, daysAccessRemaining: updatedDaysRemaining })
      .take(1)
      .subscribe((res) => {
        this.user.daysAccessRemaining = res.daysAccessRemaining
        this.messages.extendAccessSuccess = true
      }, (err) => {
        console.error(err)
        this.messages.extendAccessError = true
      }
    )
  }
}