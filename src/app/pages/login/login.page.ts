import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { addIcons } from 'ionicons';
import { 
  megaphoneOutline, 
  personAddOutline, 
  checkmarkCircleOutline, 
  trophyOutline, 
  peopleOutline, 
  rocketOutline, 
  giftOutline, 
  chatbubblesOutline,
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  logInOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonCard,
    IonCardContent,
    IonIcon
  ]
})
export class LoginPage {
  email = '';
  password = '';
  mensaje = '';
  isRegisterMode = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({
      megaphoneOutline,
      personAddOutline,
      checkmarkCircleOutline,
      trophyOutline,
      peopleOutline,
      rocketOutline,
      giftOutline,
      chatbubblesOutline,
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      logInOutline,
      alertCircleOutline
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.mensaje = ''; // Limpiar mensajes al cambiar modo
    this.email = ''; // Opcional: limpiar campos
    this.password = '';
  }

  async login() {
    if (!this.email || !this.password) {
      this.mensaje = 'Por favor completa todos los campos';
      return;
    }

    const { data, error } = await this.supabaseService.login(
      this.email,
      this.password
    );

    if (error) {
      this.mensaje = error.message;
      return;
    }

    if (data?.user) {
      localStorage.setItem('user', JSON.stringify({
        email: data.user.email,
        id: data.user.id,
        created_at: data.user.created_at
      }));
    }

    this.router.navigateByUrl('/home');
  }

  async register() {
    if (!this.email || !this.password) {
      this.mensaje = 'Por favor completa todos los campos';
      return;
    }

    const { error } = await this.supabaseService.register(
      this.email,
      this.password
    );

    if (error) {
      this.mensaje = error.message;
      return;
    }

    this.mensaje = '¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.';
    
    // Opcional: cambiar automáticamente al modo login después de 3 segundos
    setTimeout(() => {
      if (this.mensaje.includes('exitoso')) {
        this.toggleMode();
      }
    }, 3000);
  }
}