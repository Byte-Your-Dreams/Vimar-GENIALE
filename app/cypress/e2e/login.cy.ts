describe('Dashboard page', () => {

    let testData: any;

    before(() => {
      cy.loadTestData().then((data) => {
        testData = data;
      });
    });

    it('Should show dashboard for logged-in users', () => {
        cy.performLogin(
            testData.users.admin.username, 
            testData.users.admin.password
        ).then((isLogged) => {
            cy.log(`Login status: ${isLogged}`);
            if (isLogged) {
                cy.visit('/dashboard');
                cy.contains('Pannello di Controllo');
            } else {
                cy.log('User is NOW logged in');
            }
        });
    });

    it('Should show login prompt for non-logged-in users', () => {
        cy.performLogin(
            testData.users.invalid.username, 
            testData.users.invalid.password
        ).then((isLogged) => {
            cy.log(`Login status: ${isLogged}`);
            if (!isLogged) {
                cy.visit('/dashboard');
                cy.url().should('include', '/login');
            }
        });
    });
});