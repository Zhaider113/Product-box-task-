'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('Users', [{
      name: 'John Doe',
      otp: '0987',
      otp_expiration_date: Sequelize.literal("CURRENT_TIMESTAMP"),
      phone_number: '03000000000'
    }], {});
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('user', null, {});
     */
  }
};
