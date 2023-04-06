describe('template spec', () => {
  it('passes', () => {
    cy.visit(Cypress.env('base_url'))
    cy.wait(2000)
  })
})
