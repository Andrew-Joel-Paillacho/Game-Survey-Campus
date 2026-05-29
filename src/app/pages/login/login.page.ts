import { Component } from '@angular/core';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
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
  alertCircleOutline,
  gameControllerOutline,
  schoolOutline,
  shieldCheckmarkOutline,
  heartOutline,
  heartCircleOutline,
  timeOutline,
  bulbOutline,
  peopleCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage {
  email = '';
  password = '';
  mensaje = '';
  isRegisterMode = false;
  isError = false;
  private timeoutId: any;

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
      alertCircleOutline,
      gameControllerOutline,
      schoolOutline,
      shieldCheckmarkOutline,
      heartOutline,
      heartCircleOutline,
      timeOutline,
      bulbOutline,
      peopleCircleOutline
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.clearMessage();
    this.email = '';
    this.password = '';
  }

  clearMessage() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.mensaje = '';
    this.isError = false;
  }

  showMessage(text: string, isError: boolean = false) {
    this.clearMessage();
    this.mensaje = text;
    this.isError = isError;
    
    // Auto-ocultar después de 3 segundos
    this.timeoutId = setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  async login() {
    if (!this.email || !this.password) {
      this.showMessage('❌ Por favor completa todos los campos', true);
      return;
    }

    const { data, error } = await this.supabaseService.login(
      this.email,
      this.password
    );

    if (error) {
      this.showMessage(`❌ ${error.message}`, true);
      return;
    }

    // Guardar datos del usuario
    if (data?.user) {
      localStorage.setItem('user', JSON.stringify({
        email: data.user.email,
        id: data.user.id,
        created_at: data.user.created_at
      }));
    }

    this.showMessage('✅ ¡Inicio de sesión exitoso! Redirigiendo a la encuesta...', false);
    
    // Redirigir al home después de 1.5 segundos
    setTimeout(() => {
      this.router.navigateByUrl('/home');
    }, 1500);
  }

  async register() {
    if (!this.email || !this.password) {
      this.showMessage('❌ Por favor completa todos los campos', true);
      return;
    }

    const { error } = await this.supabaseService.register(
      this.email,
      this.password
    );

    if (error) {
      this.showMessage(`❌ ${error.message}`, true);
      return;
    }

    this.showMessage('✅ ¡Registro exitoso! Revisa tu correo para confirmar tu cuenta', false);
    
    // Limpiar campos después del registro exitoso
    setTimeout(() => {
      if (!this.isError) {
        this.toggleMode(); // Cambiar a modo login después de 3 segundos
      }
    }, 3000);
  }
}