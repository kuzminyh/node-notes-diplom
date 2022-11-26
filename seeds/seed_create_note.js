/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
//   npx knex seed:run
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('notes').del()
  await knex('notes').insert([
    {
      time_create: '20221001',
      user_id: 1,
      note: 'я заметка',
      title: 'title'
    },
  ]);
};

