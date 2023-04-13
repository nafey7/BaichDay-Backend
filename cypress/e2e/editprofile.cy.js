describe('Edit Profile Functionality', () => {
    it('Edit all details', () => {
      let update = {
        firstName: "Arslan",
        lastName: "Tarar",
        password: "abcd12345",
        contact: '03214567567',
        address: "House 333 B, Phase 4, DHA",
        city: "Lahore"
      }
      cy.visit(Cypress.env('base_url') + '/login')
      cy.wait(2000)
      cy.on('uncaught:exception', (err, runnable) => {
        console.log("Error", err)
        return false
      })
      cy.get('input[data-cy=email-login]').type('arslantarar@gmail.com')
      cy.get('input[data-cy=password-login]').type('abcd1234')
      cy.get('input[data-cy=customer-radio]').check()
      cy.get('button[data-cy=login-button]').click()
      cy.wait(2000)
      cy.get('#profile-icon').click()
      cy.get('#profile-id').click()
      cy.url().should('eq', 'http://localhost:3000/CustomerProfile')
      cy.get('input[data-cy=firstName-input]').type(update.firstName, {force: true})
      cy.get('input[data-cy=lastName-input]').type(update.lastName, {force: true})
      cy.get('input[data-cy=password-input]').type(update.password, {force: true})
      cy.get('input[data-cy=contact-input]').type(update.contact, {force: true})
      cy.get('input[data-cy=address-input]').type(update.address, {force: true})
      cy.get('input[data-cy=city-input]').type(update.city, {force: true})
      cy.get('.container').eq(0).find('div').eq(2).find('div').eq(1).find('div').find('#country-select').click()
      cy.contains('Portugal').click()
      cy.get('#apply-button').click()
      cy.wait(3000)
      cy.get('input[data-cy=firstName-input]').should('have.attr', 'placeholder', update.firstName)
      cy.get('input[data-cy=lastName-input]').should('have.attr', 'placeholder', update.lastName)
      cy.get('input[data-cy=contact-input]').should('have.attr', 'placeholder', update.contact)
      cy.get('input[data-cy=address-input]').should('have.attr', 'placeholder', update.address)
      cy.get('input[data-cy=city-input]').should('have.attr', 'placeholder', update.city)
    })
})