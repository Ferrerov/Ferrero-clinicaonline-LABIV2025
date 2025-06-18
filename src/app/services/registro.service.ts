import { inject, Injectable } from '@angular/core';
import { SupabaseDbService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  supabase = inject(SupabaseDbService);
  constructor() { }
}
