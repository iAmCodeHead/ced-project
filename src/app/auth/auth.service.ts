import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

import { Storage } from '@ionic/storage';
import { User } from './user';
import { AuthResponse } from './auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  AUTH_SERVER_ADDRESS  =  'https://boiling-springs-11927.herokuapp.com';
  authSubject  =  new  BehaviorSubject(false);
  loggedIn: boolean;
  userData: any;
  studentName: any;
  studentDept: any;
  studentLevel: any;
  mobileNo: any;

  constructor(private  httpClient: HttpClient, private  storage: Storage) { }

  register(user: User): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.AUTH_SERVER_ADDRESS}/register`, user).pipe(
      tap(async (res: AuthResponse ) => {

        if (res.user) {
          await this.storage.set('ACCESS_TOKEN', res.user.access_token);
          await this.storage.set('EXPIRES_IN', res.user.expires_in);
          this.authSubject.next(true);
        }
      })

    );
  }

  login(user: User): Observable<AuthResponse> {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/login`, user).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set('ACCESS_TOKEN', res.user.access_token);
          await this.storage.set('EXPIRES_IN', res.user.expires_in);
          await this.storage.set('STUDENT_NAME', res.user.student_name);
          await this.storage.set('STUDENT_DEPT', res.user.student_dept);
          await this.storage.set('STUDENT_LEVEL', res.user.student_level);
          await this.storage.set('MOBILE_NO', res.user.mobile_no);
          this.authSubject.next(true);
          this.loggedIn = true;
          // console.log(res.user);
          this.userData = res.user;
        }
      })
    );
  }

  async profile() {
    // this.storage.get('STUDENT_NAME').then((res) => {
    //   this.studentName = res;
    // });
    // this.storage.get('STUDENT_DEPT').then((res) => {
    //   this.studentDept = res;
    // });
    // this.storage.get('STUDENT_LEVEL').then((res) => {
    //   this.studentLevel = res;
    // });
    // this.storage.get('MOBILE_NO').then((res) => {
    //   this.mobileNo = res;
    // });
    // this.userData = {
    //   name: this.studentName,
    //   level: this.studentLevel,
    //   dept: this.studentDept,
    //   mobile: this.mobileNo
    // };
    return await this.userData;
  }

  async logout() {
    await this.storage.remove('ACCESS_TOKEN');
    await this.storage.remove('EXPIRES_IN');
    await this.storage.remove('STUDENT_NAME');
    await this.storage.remove('STUDENT_DEPT');
    await this.storage.remove('STUDENT_LEVEL');
    await this.storage.remove('MOBILE_NO');
    this.authSubject.next(false);
    this.loggedIn = false;
  }

  isLoggedIn() {
    return this.authSubject.asObservable();
  }

  sendSms(data) {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/send-sms`, data);
  }
}
