describe('Feedback System', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });
  
  beforeEach(() => {
    cy.visit('/');
    cy.performLogin(
      testData.users.admin.username, 
      testData.users.admin.password
    );
    cy.createConversation();
    cy.wait(testData.waitTimes.short);
    cy.sendMessage(testData.messages.feedback);
  });

  it('Should submit positive feedback', () => {
    cy.get(testData.selectors.feedback.thumbsUp, { timeout: 60000 }).click();
    cy.wait(testData.waitTimes.short);
    cy.get(testData.selectors.feedback.dialogTitle).should('contain', 'piaciuto?');
    cy.get(testData.selectors.feedback.textarea).type('This is a test reason');
    cy.get(testData.selectors.feedback.submitButton).should('be.enabled').click();
  });

  it('Should require reason for negative feedback', () => {
    cy.get(testData.selectors.feedback.thumbsDown, { timeout: 60000 }).click();
    cy.wait(testData.waitTimes.short);
    cy.get(testData.selectors.feedback.dialogTitle).should('contain', 'Cosa possiamo migliorare?');
    cy.get(testData.selectors.feedback.textarea).type('This is a test reason');
    cy.get(testData.selectors.feedback.submitButton).should('be.enabled').click();
  });

  afterEach(() => {
    cy.deleteFirstConversation();
  })
});