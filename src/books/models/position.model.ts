import { Model } from 'objection';

export class Position extends Model {
  static tableName = 'positions';

  id!: number;

  book: string;

  position: number;

  timestamp: number;

  $beforeInsert() {
    this.created_at = Date.now();
  }
  created_at!: number;

  $beforeUpdate() {
    this.updated_at = Date.now();
  }
  updated_at!: number;
}
