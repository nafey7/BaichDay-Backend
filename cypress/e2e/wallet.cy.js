describe('Add Balance Functionality', () => {
    it('Balance Added Successfully', () => {
        cy.viewport(1200,768)
        cy.visit(Cypress.env('base_url') + '/login')
        cy.wait(2000)
        cy.on('uncaught:exception', (err, runnable) => {
            console.log("Error", err)
            return false
        })
        cy.get('input[data-cy=email-login]').type('waqarzaka@gmail.com');
        cy.get('input[data-cy=password-login]').type('abcd1234');
        cy.get('input[data-cy=customer-radio]').check();
        cy.get('button[data-cy=login-button]').click();
        cy.get('#profile-icon').click()
        cy.get('#wallet-id').click()
        cy.url().should('eq', 'http://localhost:3000/wallet')
        cy.wait(3000);
        cy.get('#current-balance')
        .invoke('text')
        .then(originalValue => {
            console.log('Original balance:', originalValue);

            // Add balance to the wallet
            cy.get('button[data-cy=add-balance-button]').click();
            cy.url().should('eq', 'http://localhost:3000/payment')
            cy.get('input[data-cy=balance-amount]').clear().type(2000);
            cy.get('button[data-cy=confirm-payment-button]').click();
            cy.url().should('eq', 'http://localhost:3000/wallet')
            cy.wait(3000);

            // Get the updated balance value and compare to original value
            cy.get('#current-balance')
                .invoke('text')
                .then(newValue => {
                    console.log('New balance:', newValue);
                    expect(parseInt(newValue.substring(1,))).to.equal(parseInt(originalValue.substring(1,))+2000);
                });
        });

      })
})