describe('template spec', () => {
  it('passes', () => {
    cy.viewport(1200,768)
    cy.visit(Cypress.env('base_url'))
    cy.wait(2000)
    cy.on('uncaught:exception', (err, runnable) => {
      console.log("Error", err)
      return false
    })
    cy.contains('Featured Products').should('exist')
  })
})
