describe('Add Product Functionality', () => {
    it('Product added successfully', () => {
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
      cy.get('button[data-cy=sell-button]').click()
      cy.wait(2000)
      cy.get('input[data-cy=name-input]').type('Piano')
      cy.get('input[data-cy=description-input]').type('This is a piano in good condition')
      cy.get('input[data-cy=amount-input]').type('100')
      cy.get('input[data-cy=duration-input]').type('24')
      cy.get('#category-select').click()
      cy.contains('Music').click()
      cy.fixture('Piano.jpg', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((file) => {
          cy.get('input[data-cy="image-input"]').attachFile({
          fileContent: file,
          fileName: 'Piano.jpg',
          mimeType: 'image/jpeg'
          });
      });
      cy.get('button[data-cy=product-button]').click()
      cy.url().should('eq', 'http://localhost:3000/')
      cy.wait(2000)
    })
})