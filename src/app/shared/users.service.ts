import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'

import { AuthService, UserDetails, UserUpdate } from './'

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

  public archiveUser(userId: string, archive: boolean): Observable<UpdateUserResponse> {
    return this.http.post<UpdateUserResponse>(
      [this._auth.getServiceUrl(), "users", archive ? "archive": "unarchive"].join("/") + `?profileId=${userId}`,
      {},
      { withCredentials: true }
    )
  }

  public updateUser(update: UserUpdate): Observable<UserDetails> {
    return this.http.post<UserDetails>(
      [this._auth.getServiceUrl(), "users", "updateUserDetails"].join("/") + `?profileId=${update.profileId}`,
      update,
      {
        withCredentials: true
      }
    )
  }

  /**
   * Gets institutional users
   */
  public getUsers(): Observable<ListUsersResponse[]> {
    return this.http.get<ListUsersResponse[]>(
      [this._auth.getServiceUrl(), "users", "manageUsers"].join("/") + '?type=active',
      { withCredentials: true }
    )
  }

  public registerUsers(users: { email: string, password: string, role: string, portal: string, institutionId: string }[]): Observable<RegisterUsersResponse> {
    return this.http.post<RegisterUsersResponse>(
      [this._auth.getServiceUrl(), "users", "create"].join("/"),
      users,
      { withCredentials: true }
    )
  }
}

interface UpdateUserResponse {
  profileId: string
  userId: string
  institutionId: string
  portalName: string
  active: boolean
  roles: string
  pcAllowed: boolean
  ssEnabled: boolean
  timeLastAccessed: string
}

interface ListUsersResponse {
  email: string,
  active: boolean,
  roles: string,
  profileid: number,
  userid: number,
  institutionid: number,
  ssenabled: boolean,
  createdate: Date,
  timelastaccessed: Date
}

interface RegisterUsersResponse {
  status: boolean
  error: string
  users: {
    email: string
    status: boolean
    error: string
    account: {
      id: string,
      legacyId: string,
      internalId: string,
      type: string,
      name: string,
      contactName: string,
      contactEmail: string,
      status: string,
      roles: string,
      credentials: string,
      createTime: string
    }
    profile: {
      "profileId": number,
      "userId": string,
      "institutionId": string,
      "portalName": string,
      "active": boolean,
      "roles": string,
      "pcAllowed": boolean,
      "ssEnabled": boolean,
      "timeLastAccessed": string
    }
  }[]
}