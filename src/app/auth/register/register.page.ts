import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  loading: any;
  constructor(private  authService: AuthService,
              private  router: Router,
              public loadingController: LoadingController) { }


              async presentLoadingWithOptions() {
                this.loading = await this.loadingController.create({
                  spinner: 'bubbles',
                  message: 'Please wait...',
                  translucent: true,
                  cssClass: 'custom-class custom-loading'
                });
                this.loading.present();

                setTimeout(() => {
                  this.loading.dismiss();
                }, 5000);
              }

  register(form) {
    this.presentLoadingWithOptions();
    this.authService.register(form.value).subscribe((res) => {
      this.router.navigateByUrl('dashboard');
    });
  }

  ngOnInit() {
  }

}
