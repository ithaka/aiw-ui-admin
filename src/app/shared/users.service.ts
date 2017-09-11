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
    return this.http.get<UserDetails>(
      [this._auth.getServiceUrl(), "users", "userDetails", userId].join("/"),
      { withCredentials: true }
    )
  }

  public archiveUser(userId: string): Observable<ArchiveUserResponse> {
    return this.http.post<ArchiveUserResponse>(
      [this._auth.getServiceUrl(), "users", "archive"].join("/") + `?profileId=${userId}`,
      {},
      { withCredentials: true }
    )
  }

  public unarchiveUser(userId: string): Observable<ArchiveUserResponse> {
    return this.http.post<ArchiveUserResponse>(
      [this._auth.getServiceUrl(), "users", "unarchive"].join("/") + `?profileId=${userId}`,
      {},
      { withCredentials: true }
    )
  }
}

interface ArchiveUserResponse {
  profileId: number,
  userId: string,
  institutionId: string,
  portalName: string,
  active: boolean,
  roles: string,
  pcAllowed: boolean,
  ssEnabled: boolean,
  timeLastAccessed: string
}