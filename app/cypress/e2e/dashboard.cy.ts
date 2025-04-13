describe('Login API Test', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });
  
  it('Should log in via API and access the dashboard', () => {
    cy.performApiLogin('admin@placeholder.com', 'password', 200).then((response) => {

      cy.visit('/');
      cy.log(`Access token: ${response.body.access_token}`);

      cy.setCookie('auth_token', response.body.access_token);
      cy.log('Cookie set successfully (auth token)');
      
      cy.setCookie('refresh_token', response.body.refresh_token);
      cy.log('Cookie set successfully (refresh token)');
    
      cy.wait(1000);
      cy.visit('/dashboard');
      cy.get('.loading-line').should('exist');
      cy.wait(1000);
      cy.get('.dashLink').should('contain', 'Dashboard').click();
      cy.get('.title').should('contain', 'Pannello di Controllo');

    });
  });

  it('Should fail login with invalid credentials', () => {
    cy.performApiLogin('invaliduser@example.com', 'wrongpassword', 400).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});

// describe('Dashboard Tests', () => {
//   beforeEach(() => {

//     performApiLogin('admin@placeholder.com', 'password', 200).then((response) => {
//       cy.setCookie('auth_token', response.body.access_token);
//       cy.setCookie('refresh_token', response.body.refresh_token);
//     });

//     cy.wait(1000);
//     cy.visit('/dashboard');
//     cy.get('.navLink').contains('Chat').click();

//   });

//   it('Should access the dashboard and verify the title', () => {
//     cy.get('.title').should('contain', 'Pannello di Controllo');
//   });

//   it('Should show Chart 1', () => {
//     cy.get('.gridContainer > :nth-child(1)').should('contain', 'Andamento Generale');
//   });

//   it('Should show Chart 2', () => {
//     cy.get('.gridContainer > :nth-child(2)').should('contain', 'Numero Messaggi per Settimana');
//   });

//   it('Should show Chart 3', () => {
//     cy.get('.gridContainer > :nth-child(3)').should('contain', 'Numero messaggi feedback');
//   });
// });

