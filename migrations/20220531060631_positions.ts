import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('positions', function (table) {
    table.increments('id').primary();
    table.integer('client_id');
    table.string('book').notNullable();
    table.float('position').notNullable();
    table.integer('timestamp').notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('updated_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('positions');
}
