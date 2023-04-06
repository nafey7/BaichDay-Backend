describe('Bidding Functionality', () => {
    it('Bidding successful', () => {
      cy.visit(Cypress.env('base_url') + '/login')
      cy.wait(2000)
      cy.on('uncaught:exception', (err, runnable) => {
        console.log("Error", err)
        return false
      })
      cy.get('input[data-cy=email-login]').type('arslantarar@gmail.com');
      cy.get('input[data-cy=password-login]').type('abcd1234');
      cy.get('input[data-cy=customer-radio]').check();
      cy.get('button[data-cy=login-button]').click();
      cy.wait(2000)
      cy.contains('Air Jordan 1').click()
    })
})