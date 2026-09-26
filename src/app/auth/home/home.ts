import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        console.log(data);
        if (data.status == 'success') {
          this.user = data.data;
          this.cdr.detectChanges(); // force the screen to update right now
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        window.alert(data.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        window.alert('Error logging out. Please try again.');
      }
    });
  }
}