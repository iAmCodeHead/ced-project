import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(public alertController: AlertController, private  authService: AuthService, private  router: Router) { }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Oops!',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  login(form) {
    this.authService.login(form.value).subscribe((res) => {
      form.reset();
      this.router.navigateByUrl('dashboard');
      this.router.routeReuseStrategy.shouldReuseRoute = () => {
        return false;
      };
    }, (error) => {
      if (error.status === 404) {
        this.presentAlert('Incorrect username and password combination');
      } else if (error.status === 500) {
        this.presentAlert('Internal server error');
      } else if (error.status === 401) {
        this.presentAlert('Password not valid');
      }
    });
  }

  ngOnInit() {
  }

}
