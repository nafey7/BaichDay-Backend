describe('Login Functionality', () => {
    it('Logs in successfully', () => {
      cy.visit('/login')
      cy.get('#email').type('user@example.com')
      cy.get('#password').type('password')
      cy.get('#login-button').click()
      cy.url().should('include', '/dashboard')
    })
  })