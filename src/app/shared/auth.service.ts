import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs/Observable'

@Injectable()
export class AuthService {
  private requestOptions: RequestOptions

  private hostname = "//admin.stage.artstor.org"

  constructor(
    private http: Http
  ) {
    this.requestOptions = new RequestOptions({ withCredentials: true })
  }

  public getUrl(): string {
    return this.hostname + "/admin"
  }

  /**
   * 
   */
  public getDefaultOptions(): RequestOptions {
    return this.requestOptions
  }

  /**
   * Makes http call to log user into admin tools, which returns sessionid cookie
   * @param username user's email
   * @param password user's password
   */
  public login(username: string, password: string): Observable<any> {
    let data = this.formEncode({
      username: username,
      password: password
    })

    return this.http.post(
      [this.getUrl(), "users", "login"].join("/"),
      data
    )
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