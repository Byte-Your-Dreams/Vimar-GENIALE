describe('Dashboard Tests', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
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

  it('Should access the dashboard and verify the title', () => {
    cy.get(testData.selectors.dashboard.title).should('contain', 'Pannello di Controllo');
  });

  it('Should show Update button', () => {
    cy.get(testData.selectors.dashboard.updateButton).should('exist');
    cy.get(testData.selectors.dashboard.updateButton).should('contain', 'Aggiorna');
  });

  it('Should show Charts', () => {
    cy.wait(testData.waitTimes.medium);
    
    cy.get(testData.selectors.dashboard.charts.replace('%d', '1')).should('exist');
    cy.get(testData.selectors.dashboard.charts.replace('%d', '2')).should('exist');
    cy.get(testData.selectors.dashboard.charts.replace('%d', '3')).should('exist');
    cy.get(testData.selectors.dashboard.charts.replace('%d', '4')).should('exist');
  });
});

