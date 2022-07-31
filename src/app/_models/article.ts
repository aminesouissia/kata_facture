export interface Article {
  id: number;
  description: string;
  prix_unitaire: number;
  type: string;
  quantitees: number;
  importe: boolean;
  taxes: number;
  total_ht: number;
  total_ttc: number;
}
