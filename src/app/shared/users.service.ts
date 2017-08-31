import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'

import { AuthService } from './'

@Injectable()
export class UsersService {

  constructor(
    private http: HttpClient,
    private _auth: AuthService
  ) { }

  private getUserDetails(userId: string): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(
      [this._auth.getServiceUrl(), "users", "userDetails", userId].join("/")
    )
  }
}

interface UserDetailsResponse {
  createdDate: string
  totalAccessDays: number
  hasAdminPriv: boolean
  ssEnabled: boolean
  archivedUser: boolean
  optInEmail: boolean
  user: string,
  daysAccessRemaining: number
  profileId: number
  optInSurvey: boolean
  timeLastAccessed: string
  ssAdmin: boolean
}