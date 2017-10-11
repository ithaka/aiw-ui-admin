import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { DatePipe } from '@angular/common'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { AuthService, UserDetails, UserUpdate } from './'

@Injectable()
export class UsersService {

  constructor(
    private http: HttpClient,
    private _auth: AuthService,
    private _date: DatePipe
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
   * Gets all institutional users
   */
  public getAllUsers(): Observable<any> {
    return Observable.forkJoin([
      this.http.get<ListUsersResponse[]>(
        [this._auth.getServiceUrl(), "users", "manageUsers"].join("/") + '?type=active',
        { withCredentials: true }
      ),
      this.http.get<ListUsersResponse[]>(
        [this._auth.getServiceUrl(), "users", "manageUsers"].join("/") + '?type=archive',
        { withCredentials: true }
      )
    ])
    .map((data: any[]) => {
      let resultArray: ListUsersResponse[] = data[0].concat(data[1]);

      // Format values for User Status & SSenabled to show in grid cells
      for(let user of resultArray){ 
        user.status = user.active ? 'Active' : 'Archive'
        user.ssValue = user.ssenabled ? '<img src="/assets/img/checkMark.gif" class="tickIcon">' : ''
        user.timelastaccessed = this._date.transform(user.timelastaccessed)
        user.createdate = this._date.transform(user.createdate)
      }

      return resultArray;
    });
  }
  
  /**
   * Gets institutional stats
   */
  public getInstitutionStats(): Observable <InstitutionStatsResponse> {
    return this.http.get<InstitutionStatsResponse>(
      [this._auth.getServiceUrl(), "users", "stats"].join("/"),
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
  status: string,
  roles: string,
  profileid: number,
  userid: number,
  institutionid: number,
  ssenabled: boolean,
  ssValue: string,
  createdate: string,
  timelastaccessed: string
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

export interface InstitutionStatsResponse {
  admin_users: Array<string>,
  activeUsers: Array<number>,
  cnt_ssUsers: Array<number>,
  registeredUsers: Array<number>
}