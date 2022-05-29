import { Column, Model, Table, PrimaryKey } from 'sequelize-typescript';

@Table
export class Position extends Model {
  @PrimaryKey
  @Column
  id: number;

  @Column
  book: string;

  @Column
  position: number;

  @Column
  timestamp: number;

}
