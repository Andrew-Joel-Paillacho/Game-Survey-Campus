import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  released: string;
  rating: number;
  ratings_count: number;
  platforms: { platform: { name: string } }[];
  genres: { name: string }[];
  description_raw: string;
  website: string;
  metacritic: number;
  developers: { name: string }[];
  publishers: { name: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class RawgService {
  private apiKey = 'fd424a07a7c544b795cf1d3ed857ce85'; // Reemplaza con tu API key real
  // Usar un proxy CORS público (solo para desarrollo)
  private corsProxy = 'https://cors-anywhere.herokuapp.com/';
  private baseUrl = 'https://api.rawg.io/api';

  constructor(private http: HttpClient) {}

  async buscarJuego(nombre: string): Promise<RawgGame[]> {
    try {
      // Intentar primero sin proxy
      try {
        const response = await firstValueFrom(
          this.http.get<any>(`${this.baseUrl}/games`, {
            params: {
              key: this.apiKey,
              search: nombre,
              page_size: 5
            }
          })
        );
        return response.results;
      } catch (error: any) {
        // Si hay error de CORS, intentar con proxy
        if (error.status === 0 || error.message?.includes('CORS')) {
          console.log('Error de CORS, intentando con proxy...');
          const response = await firstValueFrom(
            this.http.get<any>(`${this.corsProxy}${this.baseUrl}/games`, {
              params: {
                key: this.apiKey,
                search: nombre,
                page_size: 5
              }
            })
          );
          return response.results;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al buscar juego:', error);
      throw error;
    }
  }

  async obtenerDetallesJuego(id: number): Promise<RawgGame> {
    try {
      try {
        const response = await firstValueFrom(
          this.http.get<RawgGame>(`${this.baseUrl}/games/${id}`, {
            params: { key: this.apiKey }
          })
        );
        return response;
      } catch (error: any) {
        if (error.status === 0 || error.message?.includes('CORS')) {
          const response = await firstValueFrom(
            this.http.get<RawgGame>(`${this.corsProxy}${this.baseUrl}/games/${id}`, {
              params: { key: this.apiKey }
            })
          );
          return response;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      throw error;
    }
  }
}