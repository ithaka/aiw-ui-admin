import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { UserDetails, UserUpdate, UsersService } from '../../shared'

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
    permissionsError?: boolean,
    permissionsSuccess?: boolean,
    extendAccessError?: boolean,
    extendAccessSuccess?: boolean
  } = {}
  private submitted: boolean

  constructor(
    private activeModal: NgbActiveModal,
    private _users: UsersService,
    private route: ActivatedRoute,
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
        this.user.archivedUser = !this.user.archivedUser
        this.messages.archiveSuccess = true
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
    this._users.updateUser({ profileId: this.user.profileId, daysAccessRemaining: this.user.totalAccessDays + 30 })
      .take(1)
      .subscribe((res) => {
        this.user.totalAccessDays = res.daysAccessRemaining
        this.messages.extendAccessSuccess = true
      }, (err) => {
        console.error(err)
        this.messages.extendAccessError = true
      }
    )
  }
}