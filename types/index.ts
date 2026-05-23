export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  genero: 'Masculino' | 'Femenino' | 'Otro' | null;
  total_visitas: number;
  fecha_ultima_visita: string | null;
  acepta_marketing: boolean;
  created_at: string;
}

export interface Premio {
  id: string;
  ruleta_id: string;
  nombre: string;
  descripcion: string | null;
  emoji: string;
  probabilidad: number;
  stock: number;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface Ruleta {
  id: string;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias: string[];
  condicion: string;
  visitas_minimas: number;
  activa: boolean;
  configuracion: { premiosIds: string[] } | null;
  created_at: string;
}

export interface Visita {
  id: string;
  cliente_id: string;
  fecha: string;
  ruleta_id: string | null;
  premio_ganado: string | null;
  created_at: string;
}

export interface ConfigEntry {
  clave: string;
  valor: string;
}

export type ConfigMap = Record<string, string>;
