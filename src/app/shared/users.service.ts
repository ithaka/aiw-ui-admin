import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'

import { AuthService } from './'
import { UserDetails } from './'

@Injectable()
export class UsersService {

  constructor(
    private http: HttpClient,
    private _auth: AuthService
  ) { }

  public getUserDetails(userId: string): Observable<UserDetails> {
    // return this.http.get<UserDetails>(
    //   [this._auth.getServiceUrl(), "users", "userDetails", userId].join("/")
    // )

    return Observable.of({
      "createdDate": "2016-01-13 00:00:00",
      "totalAccessDays": 120,
      "hasAdminPriv": true,
      "ssEnabled": true,
      "archivedUser": false,
      "optInEmail": true,
      "user": "qabackdoor001@artstor.org",
      "daysAccessRemaining": 110,
      "profileId": 648548,
      "optInSurvey": true,
      "timeLastAccessed": "2017-08-22T15:04:05.000+0000",
      "ssAdmin": true
    })
  }
}