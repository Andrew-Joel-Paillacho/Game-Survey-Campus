import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Encuesta {
  id?: string;
  nombre_alias: string;
  edad_rango: string;
  rol: string;
  videojuego_favorito: string;
  plataforma: string;
  genero_favorito: string;
  comentario: string;
  latitud: number;
  longitud: number;
  lugar_campus: string;
  imagen_url?: string;
  user_id: string;
  created_at?: string;
  incluir_ubicacion?: boolean; // Campo para controlar si se incluye ubicación
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  register(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password
    });
  }

  logout() {
    return this.supabase.auth.signOut();
  }

  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  // Guardar encuesta con imagen
  async guardarEncuesta(encuesta: Omit<Encuesta, 'id' | 'created_at'>, imagenFile?: File) {
    let imagen_url = null;
    
    // Subir imagen si existe
    if (imagenFile) {
      const fileExt = imagenFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `encuestas/${fileName}`;
      
      const { error: uploadError } = await this.supabase.storage
        .from('encuestas-imagenes')
        .upload(filePath, imagenFile);
      
      if (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = this.supabase.storage
        .from('encuestas-imagenes')
        .getPublicUrl(filePath);
      
      imagen_url = publicUrl;
    }
    
    // Guardar encuesta
    const { data, error } = await this.supabase
      .from('encuestas')
      .insert([{ ...encuesta, imagen_url }])
      .select();
    
    if (error) {
      console.error('Error al guardar encuesta:', error);
      throw error;
    }
    
    return data;
  }
  
  // Obtener todas las encuestas
  async obtenerEncuestas() {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al obtener encuestas:', error);
      throw error;
    }
    
    return data;
  }
  
  // Actualizar encuesta
  async actualizarEncuesta(id: string, encuesta: Partial<Encuesta>, imagenFile?: File) {
    let imagen_url = encuesta.imagen_url;
    
    // Subir nueva imagen si existe
    if (imagenFile) {
      const fileExt = imagenFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `encuestas/${fileName}`;
      
      const { error: uploadError } = await this.supabase.storage
        .from('encuestas-imagenes')
        .upload(filePath, imagenFile);
      
      if (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = this.supabase.storage
        .from('encuestas-imagenes')
        .getPublicUrl(filePath);
      
      imagen_url = publicUrl;
    }
    
    const { data, error } = await this.supabase
      .from('encuestas')
      .update({ ...encuesta, imagen_url })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error al actualizar encuesta:', error);
      throw error;
    }
    
    return data;
  }
  
  // Eliminar encuesta
  async eliminarEncuesta(id: string) {
    const { error } = await this.supabase
      .from('encuestas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error al eliminar encuesta:', error);
      throw error;
    }
    
    return true;
  }
}