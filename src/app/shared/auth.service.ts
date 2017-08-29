import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'

import { PrimaryUser } from './datatypes'

@Injectable()
export class AuthService {

  private hostname = "//admin.stage.artstor.org"
  private ENV = 'dev'
  /**
   * This is typcast to create an initial object reference
   *  because we pass the same reference around the entire site
   */
  private _user: PrimaryUser = <PrimaryUser>{}

  constructor(
    private http: HttpClient
  ) {
  }

  public getServiceUrl(legacy?: boolean): string {
    let serviceUrl = '//art-aa-service.apps.'
    this.ENV === 'dev' ? serviceUrl += 'test' : serviceUrl += 'prod' // switch between dev and prod urls
    serviceUrl += '.cirrostratus.org'
    legacy ? serviceUrl += "/api" : serviceUrl += '/admin'

    return serviceUrl
  }

  get user(): PrimaryUser {
    return this._user
  }

  set user(user: PrimaryUser) {
    // because we want to keep the same object referenced, instead of setting the object to a new user,
    //  we will clear out and use the same object
    Object.keys(this._user).forEach((key) => {
      delete this._user[key]
    })

    // take all of the properties from the new object and assign them
    Object.keys(user).forEach((key) => {
      this._user[key] = user[key]
    })
  }

  /**
   * Makes http call to log user into admin tools, which returns sessionid cookie
   * @param username user's email
   * @param password user's password
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    // let data = new URLSearchParams()
    // data.append('username', username)
    // data.append('password', password)

    let data = this.formEncode({
      username: username,
      password: password
    })

    // let options = this.getDefaultOptions()
    // options.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })

    return this.http.post<LoginResponse>(
      [this.getServiceUrl(), "users", "login"].join("/"),
      data,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
      }
    )
  }

  /**
   * Gets the logged in user's institution's info
   */
  public getInstitution(): Observable <InstitutionInfoResponse> {
    // MOCK DATA B/C RIGHT NOW THE SERVICE REQUIRES A URL PARAMETER WE CANNOT PROVIDE
    return Observable.of({
      "institution": {
        "country": "United States",
        "id": "1000",
        "name": "ARTstor",
        "access_code": "awmfmellon",
        "access_password": "artstor",
        "default_user_id": "110",
        "default_user_pwd": "artstor1",
        "display_name": "ARTstor",
        "region_id": "1",
        "ss_enabled": "1"
      },
      "instsupport": {
        "contact_email": "rhefee.estrella@artstor.org",
        "contact_name": "Rhefee Estrella",
        "contact_tel": "631-687-2639",
        "institution_id": 1000,
        "show_option": "1"
      }
    })

    // FOR AFTER THE URL IS CHANGED TO RETURN USER'S INSTITUTION AUTOMATICALLY
    // return this.http.get<InstitutionInfoResponse>(
    //   [this.getServiceUrl(), "institution"].join("/")
    // )
  }

  /**
   * Encodes javascript object into a URI component
   * @param obj The object to be encoded
   */
  public formEncode(obj: Object): string {
    var encodedString = '';
    for (var key in obj) {
        if (encodedString.length !== 0) {
            encodedString += '&';
        }
        encodedString += key + '=' + encodeURIComponent(obj[key]);
    }
    return encodedString.replace(/%20/g, '+');
  }
}

export interface LoginResponse {
  email: string
  firstname: string
  lastname: string
  message: string
  status: number
}

interface InstitutionInfoResponse {
  
  institution: {
    country: string,
    id: string,
    name: string,
    access_code: string,
    access_password: string,
    default_user_id: string,
    default_user_pwd: string,
    display_name: string,
    region_id: string,
    ss_enabled: string
  },
  instsupport: {
    contact_email: string,
    contact_name: string,
    institution_id: number,
    show_option: string
  }
  
}