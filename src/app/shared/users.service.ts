import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { DatePipe } from '@angular/common'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { AuthService, UserDetails, UserUpdate } from './'

@Injectable()
export class UsersService {

  //Subject observable for updatedUser
  public updatedUser: Subject<any> = new Subject();

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
        // Rely on `roles` list for evaluating `SSEnabled`
        user.ssValue = (user.roles && user.roles.includes("SHARED_SHELF_USER")) ? '<img src="/assets/img/checkMark.gif" class="tickIcon">' : ''
        
        // Making sure that the date format is compatible with the date pipe on all browsers incl. Safari
        user.timelastaccessed = this.formatDate(user.timelastaccessed)
        user.createdate = this.formatDate(user.createdate)
      }

      return resultArray;
    });
  }

  /**
   * We've been having some issue with data that comes in from services formatted incorrectly,
   *  so this is just a wrapper function to make sure errors are handled properly
   * @param date the date string you want formatted
   */
  private formatDate(date: string): string {
    if (date) {
      try {
        return this._date.transform( date.replace(' ', 'T') )
      } catch (err) {
        console.error(err)
        return '-'
      }
    } else {
      return '-'
    }
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

  public registerUsers(users: { email: string, password: string, role: string, portal: string, institutionId?: string, profileId?: string }[]): Observable<RegisterUsersResponse> {
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
    accountStatus: string
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
    }[]
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
