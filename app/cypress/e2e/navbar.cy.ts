describe('Navbar page', () => {
    let testData: any;

    before(() => {
      cy.loadTestData().then((data) => {
        testData = data;
      });
    });

    beforeEach(() => {
        cy.loadTestData().then((testData) => {       
            cy.visit('/');
        });
    });

    it('Should render Navbar component', () => {
        cy.url().should('include', '/');
    });

    it('Should check if Navbar component exists', () => {
        cy.get(testData.selectors.navbar.container).should('exist');
    });

    it('Should check if Navbar component has a title', () => {
        cy.get(testData.selectors.navbar.title).contains('Vimar GENIALE');
    });

    it('Should check if Navbar component has a logo', () => {
        cy.get(testData.selectors.navbar.logo).should('exist');
    });
});
