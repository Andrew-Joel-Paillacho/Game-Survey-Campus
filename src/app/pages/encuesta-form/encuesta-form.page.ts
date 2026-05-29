import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonToast,
  IonAvatar,
  IonCheckbox,
  IonSpinner,
  IonList,
  IonRadioGroup,
  IonBadge
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService, Encuesta } from '../../services/supabase.service';
import { LocationService } from '../../services/location';
import { RawgService, RawgGame } from '../../services/rawg.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { camera, trash, close, locationOutline, gameController, search } from 'ionicons/icons';

@Component({
  selector: 'app-encuesta-form',
  templateUrl: './encuesta-form.page.html',
  styleUrls: ['./encuesta-form.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonButton,
    IonText,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonToast,
    IonAvatar,
    IonCheckbox,
    IonSpinner,
    IonList,
    IonRadioGroup,
    IonBadge, 
    IonCardHeader
  ]
})
export class EncuestaFormPage implements OnInit {
  encuesta: Partial<Encuesta> = {
    nombre_alias: '',
    edad_rango: '',
    rol: '',
    videojuego_favorito: '',
    plataforma: '',
    genero_favorito: '',
    comentario: '',
    incluir_ubicacion: false
  };
  
  esEdicion = false;
  encuestaId: string | null = null;
  userId: string | null = null;
  imagenSeleccionada: string | null = null;
  imagenArchivo: File | null = null;
  mostrarToast = false;
  mensajeToast = '';
  colorToast = 'success';
  obteniendoUbicacion = false;
  
  // Variables para RAWG API
  busquedaJuego = '';
  resultadosBusqueda: RawgGame[] = [];
  buscandoJuego = false;
  juegoSeleccionado: RawgGame | null = null;
  mostrarResultados = false;
  datosApiObtenidos = false;
  
  rangosEdad = ['Menos de 18', '18-24', '25-34', '35-44', '45-54', '55 o más'];
  roles = ['Estudiante', 'Docente', 'Administrativo', 'Visitante'];
  plataformas = ['Móvil', 'Consola', 'PC', 'Navegador'];
  generos = ['Acción', 'Aventura', 'Deportes', 'Estrategia', 'RPG', 'Terror', 'Simulación', 'Otro'];
  lugaresCampus = ['Biblioteca', 'Aulas', 'Laboratorios', 'Cafetería', 'Áreas verdes', 'Estacionamiento', 'Gimnasio', 'Auditorio', 'Otro'];

  constructor(
    private supabaseService: SupabaseService,
    private locationService: LocationService,
    private rawgService: RawgService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ camera, trash, close, locationOutline, gameController, search });
  }

  async ngOnInit() {
    this.encuestaId = this.route.snapshot.paramMap.get('id');
    if (this.encuestaId) {
      this.esEdicion = true;
      await this.cargarEncuesta();
    }
    await this.cargarUsuario();
  }

  async cargarUsuario() {
    try {
      const { data: { user } } = await this.supabaseService.getCurrentUser();
      if (user) {
        this.userId = user.id;
      } else {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          this.userId = user.id;
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }

  async cargarEncuesta() {
    try {
      const encuestas = await this.supabaseService.obtenerEncuestas();
      const encuesta = encuestas.find(e => e.id === this.encuestaId);
      if (encuesta) {
        this.encuesta = encuesta;
        this.encuesta.incluir_ubicacion = !!(encuesta.latitud && encuesta.longitud);
        if (encuesta.imagen_url) {
          this.imagenSeleccionada = encuesta.imagen_url;
        }
        
        // Cargar datos de API si existen
        if (encuesta.rawg_game_data) {
          this.juegoSeleccionado = encuesta.rawg_game_data;
          this.datosApiObtenidos = true;
          this.encuesta.videojuego_favorito = encuesta.rawg_game_data.name;
        }
      }
    } catch (error) {
      console.error('Error al cargar encuesta:', error);
    }
  }

  async buscarJuegoEnApi() {
    if (!this.busquedaJuego.trim()) {
      this.mostrarMensaje('Ingresa el nombre de un juego para buscar', 'warning');
      return;
    }

    this.buscandoJuego = true;
    this.mostrarResultados = true;
    
    try {
      this.resultadosBusqueda = await this.rawgService.buscarJuego(this.busquedaJuego);
      if (this.resultadosBusqueda.length === 0) {
        this.mostrarMensaje('No se encontraron juegos con ese nombre', 'warning');
      }
    } catch (error: any) {
      console.error('Error al buscar:', error);
      this.mostrarMensaje('Error al buscar el juego. Verifica tu conexión o la API key', 'danger');
    } finally {
      this.buscandoJuego = false;
    }
  }

  async seleccionarJuego(juego: RawgGame) {
    this.buscandoJuego = true;
    
    try {
      // Obtener detalles completos del juego
      const detallesCompletos = await this.rawgService.obtenerDetallesJuego(juego.id);
      this.juegoSeleccionado = detallesCompletos;
      
      // Actualizar campos del formulario con la información del juego
      this.encuesta.videojuego_favorito = detallesCompletos.name;
      this.encuesta.genero_favorito = detallesCompletos.genres[0]?.name || this.encuesta.genero_favorito;
      
      // Almacenar datos completos de la API
      this.encuesta.rawg_game_id = detallesCompletos.id;
      this.encuesta.rawg_game_data = detallesCompletos;
      
      this.datosApiObtenidos = true;
      this.mostrarResultados = false;
      this.busquedaJuego = '';
      
      this.mostrarMensaje(`Información de "${detallesCompletos.name}" cargada exitosamente`, 'success');
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      this.mostrarMensaje('Error al cargar los detalles del juego', 'danger');
    } finally {
      this.buscandoJuego = false;
    }
  }

  limpiarSeleccionJuego() {
    this.juegoSeleccionado = null;
    this.datosApiObtenidos = false;
    this.encuesta.videojuego_favorito = '';
    this.encuesta.rawg_game_id = undefined;
    this.encuesta.rawg_game_data = undefined;
    this.resultadosBusqueda = [];
    this.mostrarResultados = false;
    this.busquedaJuego = '';
  }

  async seleccionarImagen() {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        if (blob.size > 500 * 1024) {
          this.mostrarMensaje('La imagen no debe superar los 500KB', 'danger');
          return;
        }
        
        this.imagenSeleccionada = image.webPath;
        const fileName = `image_${Date.now()}.jpg`;
        this.imagenArchivo = new File([blob], fileName, { type: 'image/jpeg' });
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
    }
  }

  eliminarImagen() {
    this.imagenSeleccionada = null;
    this.imagenArchivo = null;
  }

  async obtenerUbicacion() {
    if (!this.encuesta.incluir_ubicacion) {
      this.encuesta.latitud = undefined;
      this.encuesta.longitud = undefined;
      this.encuesta.lugar_campus = undefined;
      return;
    }
    
    this.obteniendoUbicacion = true;
    try {
      await this.locationService.ensurePermissions();
      const pos = await this.locationService.getCurrentPosition();
      
      this.encuesta.latitud = pos.coords.latitude;
      this.encuesta.longitud = pos.coords.longitude;
      
      this.mostrarMensaje('Ubicación obtenida correctamente', 'success');
    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
      this.mostrarMensaje('Error al obtener ubicación: ' + (error.message || 'Error desconocido'), 'danger');
      this.encuesta.incluir_ubicacion = false;
    } finally {
      this.obteniendoUbicacion = false;
    }
  }

  async cancelar() {
    this.router.navigateByUrl('/home');
  }

  async guardarEncuesta() {
    if (!this.encuesta.nombre_alias) {
      this.mostrarMensaje('Por favor ingrese el nombre o alias', 'danger');
      return;
    }
    
    if (!this.userId) {
      this.mostrarMensaje('Usuario no identificado', 'danger');
      return;
    }
    
    if (!this.encuesta.incluir_ubicacion) {
      this.encuesta.latitud = undefined;
      this.encuesta.longitud = undefined;
      this.encuesta.lugar_campus = undefined;
    }
    
    const fechaActual = new Date();
  
    try {
      const encuestaData = {
        nombre_alias: this.encuesta.nombre_alias,
        edad_rango: this.encuesta.edad_rango,
        rol: this.encuesta.rol,
        videojuego_favorito: this.encuesta.videojuego_favorito,
        plataforma: this.encuesta.plataforma,
        genero_favorito: this.encuesta.genero_favorito,
        comentario: this.encuesta.comentario,
        latitud: this.encuesta.incluir_ubicacion ? this.encuesta.latitud : null,
        longitud: this.encuesta.incluir_ubicacion ? this.encuesta.longitud : null,
        lugar_campus: this.encuesta.incluir_ubicacion ? this.encuesta.lugar_campus : null,
        user_id: this.userId,
        created_at: this.esEdicion ? this.encuesta.created_at : fechaActual.toISOString(),
        rawg_game_id: this.encuesta.rawg_game_id,
        rawg_game_data: this.encuesta.rawg_game_data
      };
      
      if (this.esEdicion) {
        await this.supabaseService.actualizarEncuesta(
          this.encuestaId!,
          encuestaData as any,
          this.imagenArchivo || undefined
        );
        this.mostrarMensaje('Encuesta actualizada exitosamente', 'success');
      } else {
        await this.supabaseService.guardarEncuesta(
          encuestaData as any,
          this.imagenArchivo || undefined
        );
        this.mostrarMensaje('Encuesta guardada exitosamente', 'success');
      }
      
      setTimeout(() => {
        this.router.navigateByUrl('/home');
      }, 1500);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      this.mostrarMensaje('Error al guardar encuesta: ' + (error.message || 'Error desconocido'), 'danger');
    }
  }

  mostrarMensaje(mensaje: string, color: string = 'success') {
    this.mensajeToast = mensaje;
    this.colorToast = color;
    this.mostrarToast = true;
    setTimeout(() => {
      this.mostrarToast = false;
    }, 3000);
  }


  // Obtener géneros como string
  getGenerosTexto(): string {
    if (!this.juegoSeleccionado?.genres) return 'N/E';
    return this.juegoSeleccionado.genres.map(g => g.name).join(', ');
  }

  // Obtener plataformas como string
  getPlataformasTexto(): string {
    if (!this.juegoSeleccionado?.platforms) return 'N/E';
    return this.juegoSeleccionado.platforms.slice(0, 3).map(p => p.platform.name).join(', ');
  }

  // Obtener desarrolladores como string
  getDesarrolladoresTexto(): string {
    if (!this.juegoSeleccionado?.developers) return 'N/E';
    return this.juegoSeleccionado.developers.map(d => d.name).join(', ');
  }
}