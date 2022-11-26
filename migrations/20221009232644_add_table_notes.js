/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// npx knex migrate: latest
exports.up = function (knex) {
  return knex.schema.createTable("notes", (table) => {
    table.increments("id");
    table.timestamp("time_created");
    table.integer("user_id").notNullable();
    table.foreign("user_id").references("users.id");
    table.string("title", 255);
    table.boolean("isArchived").defaultTo(false);
    table.varchar("note");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("notes")
};
