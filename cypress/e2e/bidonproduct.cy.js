describe('Bidding Functionality', () => {
    it('Bidding successful', () => {
      var bid = 400
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
      cy.contains('Air Jordan 1').click()
      cy.get('input[data-cy=bid-input]').type(bid)
      cy.get('button[data-cy=bid-button]').click()
      cy.url().should('eq', 'http://localhost:3000/')
      cy.wait(3000)
      cy.contains('Air Jordan 1').click()
      cy.contains(bid).should('exist')
    });

    it('Bidding failed', () => {
      var bid = 200
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
      cy.contains('Air Jordan 1').click()
      cy.get('input[data-cy=bid-input]').type(bid)
      cy.get('button[data-cy=bid-button]').click()
      cy.contains('Incorrect amount entered, plese bid over current bid').should('exist')
    });

    it('Bidding failed', () => {
      var bid = 50000
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
      cy.contains('Air Jordan 1').click()
      cy.get('input[data-cy=bid-input]').type(bid)
      cy.get('button[data-cy=bid-button]').click()
      cy.contains('Please make sure that you have sufficient funds in wallet and bid is greater than starting bid').should('exist')
    });
})