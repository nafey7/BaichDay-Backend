describe('Add Product Functionality', () => {
    it('Product added successfully', () => {
      cy.visit(Cypress.env('base_url') + '/AddProduct')
      cy.wait(3000)
      cy.on('uncaught:exception', (err, runnable) => {
        console.log("Error", err)
        return false
      })

    })
})