describe('Message Validation', () => {
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
  });

  it('Should enforce character limit of 200', () => {
    const longMessage = 'a'.repeat(201);
    cy.get(testData.selectors.messagebar.inputField).type(longMessage);
    cy.get(testData.selectors.messagebar.charCount).should('contain', '-1');
  });

  it('Should prevent sending messages with forbidden words', () => {
    cy.get(testData.selectors.messagebar.inputField).type(testData.messages.forbidden);
    cy.get(testData.selectors.messagebar.errorMessage).should('be.visible');
    cy.get(testData.selectors.messagebar.sendButton).should('be.disabled');
  });

  it('Should enable send button only with valid message', () => {
    cy.get(testData.selectors.messagebar.sendButton).should('be.disabled');
    cy.get(testData.selectors.messagebar.inputField).type('Valid test message');
    cy.get(testData.selectors.messagebar.sendButton).should('not.be.disabled');
  });
});