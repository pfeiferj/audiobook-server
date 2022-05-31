import { Model } from 'objection'

export class User extends Model {
  static tableName = 'users'

  id!: number;

  name: string;

  password: string;

  isActive!: boolean;

  isAdmin!: boolean;
}
