import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isRegisterMode = false;
  loading = false;
  hidePassword = true;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  toggle(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { username, password } = this.form.value;
    const action$ = this.isRegisterMode
      ? this.authService.register(username!, password!)
      : this.authService.login(username!, password!);

    action$.subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        const msg = err.status === 401 ? 'Invalid username or password'
          : err.status === 400 ? 'Username already taken'
          : 'Something went wrong. Try again.';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
