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

    cy.getTotalConversations().then((totalConversations) => {
     if (totalConversations > 2) {
      cy.deleteFirstConversation();
     }
    })


    cy.createConversation();
    cy.sendMessage(testData.messages.feedback);
  });

  it('Should submit positive feedback', () => {
    cy.get(testData.selectors.feedback.thumbsUp).click();
    cy.get(testData.selectors.feedback.dialogTitle).should('contain', 'Feedback Positivo');
  });

  it('Should require reason for negative feedback', () => {
    cy.get(testData.selectors.feedback.thumbsDown).click();
    cy.get(testData.selectors.feedback.textarea).should('be.required');
    cy.get(testData.selectors.feedback.submitButton).should('be.disabled');
  });
});