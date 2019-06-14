import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loading: any;
  constructor(public alertController: AlertController,
              private  authService: AuthService,
              private  router: Router,
              public loadingController: LoadingController) { }

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Oops!',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }


  async presentLoadingWithOptions() {
    this.loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Please wait...',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });

    this.loading.present();
  }

  login(form) {
    this.presentLoadingWithOptions();
    this.authService.login(form.value).subscribe((res) => {
      this.loading.dismiss();

      if (res) {
        form.reset();
        this.router.navigateByUrl('dashboard');
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
          return false;
      };

    }
     }, (error) => {
      this.loading.dismiss();

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
