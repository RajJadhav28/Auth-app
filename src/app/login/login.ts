import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login{
  LoginForm: FormGroup;

  constructor( private fb:FormBuilder, private authService: AuthService, private router: Router){
    this.LoginForm=this.fb.group({
      email:["",[Validators.required, Validators.email]],
      password:["",[Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit(){
    if(this.LoginForm.valid){
      console.log(this.LoginForm.value);

      this.authService.login(this.LoginForm.value).subscribe({
      next:(data) => {
        console.log(data);
        if(data.status === 'success') {
          // Redirect to home page or perform any other action
          this.router.navigate(['/home']);
        } else {
          console.log('Login failed');
        }
      },
      error:(err) => {
        console.log(err);
      }
  })
    }
  }
}
