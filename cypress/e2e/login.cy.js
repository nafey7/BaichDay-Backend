describe('Login Functionality', () => {
    it('Customer logs in successfully', () => {
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
      cy.url().should('eq', 'http://localhost:3000/');
      cy.wait(3000)
    });

    it('Admin logs in successfully', () => {
      cy.visit(Cypress.env('base_url') + '/login')
      cy.wait(2000)
      cy.on('uncaught:exception', (err, runnable) => {
        console.log("Error", err)
        return false
      })
      cy.get('input[data-cy=email-login]').type('nafeymoiz@gmail.com');
      cy.get('input[data-cy=password-login]').type('aabbccdd');
      cy.get('input[data-cy=admin-radio]').check();
      cy.get('button[data-cy=login-button]').click();
      cy.url().should('eq', 'http://localhost:3000/Admin');
    });

    it('Displays an error message for invalid credentials', () => {
      cy.visit(Cypress.env('base_url') + '/login')
      cy.wait(2000)
      cy.on('uncaught:exception', (err, runnable) => {
        console.log("Error", err)
        return false
      })
      cy.get('input[data-cy=email-login]').type('invalid@gmail.com')
      cy.get('input[data-cy=password-login]').type('password')
      cy.get('input[data-cy=customer-radio]').check()
      cy.get('button[data-cy=login-button]').click()
      cy.contains('Incorrect Email or Password. Please try again.').should('exist')
    });
  })