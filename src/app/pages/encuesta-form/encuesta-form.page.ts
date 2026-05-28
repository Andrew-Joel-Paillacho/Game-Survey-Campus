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
  IonIcon,
  IonButtons,
  IonBackButton,
  IonToast,
  IonAvatar,
  IonCheckbox
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService, Encuesta } from '../../services/supabase.service';
import { LocationService } from '../../services/location';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { camera, trash, close, locationOutline } from 'ionicons/icons';

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
    IonCheckbox
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
    incluir_ubicacion: false  // Nuevo campo para controlar si incluir ubicación
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
  
  // Opciones para selects
  rangosEdad = [
    'Menos de 18',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55 o más'
  ];
  
  roles = ['Estudiante', 'Docente', 'Administrativo', 'Visitante'];
  
  plataformas = ['Móvil', 'Consola', 'PC', 'Navegador'];
  
  generos = ['Acción', 'Aventura', 'Deportes', 'Estrategia', 'RPG', 'Terror', 'Simulación', 'Otro'];
  
  lugaresCampus = [
    'Biblioteca',
    'Aulas',
    'Laboratorios',
    'Cafetería',
    'Áreas verdes',
    'Estacionamiento',
    'Gimnasio',
    'Auditorio',
    'Otro'
  ];

  constructor(
    private supabaseService: SupabaseService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ camera, trash, close, locationOutline });
  }

  async ngOnInit() {
    // Verificar si es edición
    this.encuestaId = this.route.snapshot.paramMap.get('id');
    if (this.encuestaId) {
      this.esEdicion = true;
      await this.cargarEncuesta();
    }
    
    // Obtener usuario actual
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
        // Verificar si tiene ubicación
        this.encuesta.incluir_ubicacion = !!(encuesta.latitud && encuesta.longitud);
        if (encuesta.imagen_url) {
          this.imagenSeleccionada = encuesta.imagen_url;
        }
      }
    } catch (error) {
      console.error('Error al cargar encuesta:', error);
    }
  }

  async seleccionarImagen() {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      // Verificar tamaño (500KB = 500 * 1024 bytes)
      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        if (blob.size > 500 * 1024) {
          this.mostrarMensaje('La imagen no debe superar los 500KB', 'danger');
          return;
        }
        
        this.imagenSeleccionada = image.webPath;
        
        // Convertir a File
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
      // Limpiar ubicación si se desactiva
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
    console.log('Cancelando, regresando a Home');
    this.router.navigateByUrl('/home');
  }

  async guardarEncuesta() {
    // Validaciones
    if (!this.encuesta.nombre_alias) {
      this.mostrarMensaje('Por favor ingrese el nombre o alias', 'danger');
      return;
    }
    
    if (!this.userId) {
      this.mostrarMensaje('Usuario no identificado', 'danger');
      return;
    }
    
    // Si no incluye ubicación, limpiar los campos de ubicación
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
        created_at: this.esEdicion ? this.encuesta.created_at : fechaActual.toISOString()
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
}