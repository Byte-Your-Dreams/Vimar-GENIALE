describe('Message Flow', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.loadTestData().then((data) => {
      testData = data;
      cy.visit('/');
      cy.performLogin(testData.users.admin.username, testData.users.admin.password);

      cy.getTotalConversations().then((totalConversations: number) => {
        if(totalConversations >2){
          cy.selectConversation();
          cy.wait(1000);
          cy.deleteFirstConversation();
          cy.wait(1000);
        };
      });
      cy.createConversation();
    });
  });

  it('Should send and display messages', () => {
    cy.sendMessage(testData.messages.standard);
    cy.get(testData.selectors.chat.userMessage).last().should('contain', testData.messages.standard);
    cy.get(testData.selectors.chat.botMessage).last().should('be.visible');
  });

  it('Should maintain message history after page reload', () => {
    cy.sendMessage(testData.messages.persistent);
    cy.reload();
    
    cy.wait(1000);
    cy.selectConversation();
    cy.wait(1000);
    
    cy.get(testData.selectors.chat.userMessage).should('contain', testData.messages.persistent);
  });
});