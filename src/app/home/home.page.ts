import { Component, OnInit, signal } from '@angular/core';
import { 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonLabel,
  IonChip,
  IonAvatar,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonSpinner, 
  IonText,
  IonSearchbar,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { NgIf, DatePipe, NgFor, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService, Encuesta } from '../services/supabase.service';
import { addIcons } from 'ionicons';
import { add, create, trash, map } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent,
    IonButton, 
    NgIf,
    IonLabel,
    IonChip,
    IonAvatar,
    IonToast,
    DatePipe,
    DecimalPipe,
    CommonModule,
    FormsModule,
    IonFab,
    IonFabButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonSpinner,
    NgFor,
    IonText,
    IonSearchbar,
    IonList,
    IonItem
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  encuestas = signal<Encuesta[]>([]);
  encuestasFiltradas = signal<Encuesta[]>([]);
  terminoBusqueda = '';
  userEmail = signal<string | null>(null);
  userName = signal<string | null>(null);
  userId = signal<string | null>(null);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastColor = signal<string>('success');
  cargando = signal<boolean>(true);
  mostrarAlertEliminar = false;
  encuestaAEliminar: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    addIcons({ add, create, trash, map });
  }

  filtrarEncuestas() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.encuestasFiltradas.set(
      this.encuestas().filter(encuesta => 
        encuesta.nombre_alias.toLowerCase().includes(termino) ||
        (encuesta.lugar_campus && encuesta.lugar_campus.toLowerCase().includes(termino)) ||
        (encuesta.videojuego_favorito && encuesta.videojuego_favorito.toLowerCase().includes(termino))
      )
    );
  }

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarEncuestas();
  }

  async cargarUsuario() {
    try {
      const { data: { user } } = await this.supabaseService.getCurrentUser();
      if (user && user.email) {
        this.userEmail.set(user.email);
        this.userId.set(user.id);
        const nombre = user.email.split('@')[0] || 'Usuario';
        this.userName.set(nombre);
      } else {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.email) {
            this.userEmail.set(user.email);
            this.userId.set(user.id);
            const nombre = user.email.split('@')[0] || 'Usuario';
            this.userName.set(nombre);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async cargarEncuestas() {
    this.cargando.set(true);
    try {
      const encuestas = await this.supabaseService.obtenerEncuestas();
      this.encuestas.set(encuestas || []);
      this.encuestasFiltradas.set(encuestas || []);
    } catch (error: any) {
      console.error('Error al cargar encuestas:', error);
      this.mostrarMensaje('Error al cargar encuestas', 'danger');
    } finally {
      this.cargando.set(false);
    }
  }

  async eliminarEncuesta(id: string) {
    try {
      await this.supabaseService.eliminarEncuesta(id);
      await this.cargarEncuestas();
      this.mostrarMensaje('Encuesta eliminada correctamente', 'success');
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      this.mostrarMensaje('Error al eliminar encuesta', 'danger');
    }
  }

  editarEncuesta(id: string) {
    this.router.navigateByUrl(`/encuesta-form/${id}`);
  }

  verEnMapa(latitud: number, longitud: number) {
    const url = `https://www.google.com/maps?q=${latitud},${longitud}&z=15`;
    window.open(url, '_blank');
  }

  mostrarMensaje(mensaje: string, color: string = 'success') {
    this.toastMessage.set(mensaje);
    this.toastColor.set(color);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  async logout() {
    try {
      await this.supabaseService.logout();
      localStorage.removeItem('user');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.mostrarMensaje('Error al cerrar sesión', 'danger');
    }
  }

  confirmarEliminar(id: string) {
    this.encuestaAEliminar = id;
    this.mostrarAlertEliminar = true;
  }

  async crearEncuesta() {
    this.router.navigateByUrl('/encuesta-form');
  }

  verSitioWeb(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Obtener géneros como string
  getGeneros(encuesta: Encuesta): string {
    if (!encuesta.rawg_game_data?.genres) return 'N/E';
    return encuesta.rawg_game_data.genres.map((g: any) => g.name).join(', ');
  }

  // Obtener plataformas como string
  getPlataformas(encuesta: Encuesta): string {
    if (!encuesta.rawg_game_data?.platforms) return 'N/E';
    return encuesta.rawg_game_data.platforms.slice(0, 3).map((p: any) => p.platform.name).join(', ');
  }

  // Obtener desarrolladores como string
  getDesarrolladores(encuesta: Encuesta): string {
    if (!encuesta.rawg_game_data?.developers) return 'N/E';
    return encuesta.rawg_game_data.developers.map((d: any) => d.name).join(', ');
  }

  // Obtener descripción corta
  getDescripcionCorta(encuesta: Encuesta): string {
    if (!encuesta.rawg_game_data?.description_raw) return '';
    return encuesta.rawg_game_data.description_raw.length > 200 
      ? encuesta.rawg_game_data.description_raw.substring(0, 200) + '...' 
      : encuesta.rawg_game_data.description_raw;
  }

}