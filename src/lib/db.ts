import { HazardousIngredientsDB } from '@/data/hazardous-ingredients.types';
import dbData from '@/data/hazardous-ingredients-db-v2.json';

let cachedDB: HazardousIngredientsDB | null = null;

export function loadDB(): HazardousIngredientsDB {
  if (cachedDB) {
    return cachedDB;
  }

  cachedDB = dbData as HazardousIngredientsDB;
  return cachedDB;
}

export function getDB(): HazardousIngredientsDB {
  return loadDB();
}
