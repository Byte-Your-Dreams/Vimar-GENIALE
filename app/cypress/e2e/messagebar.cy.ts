describe('Messagebar Component Tests', () => {
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
      cy.performLogin(
        testData.users.admin.username, 
        testData.users.admin.password
      ).then((isLogged: boolean) => {
        cy.log(`Login status: ${isLogged}`);
        if (isLogged) {
          cy.visit('/dashboard');
          cy.contains('Pannello di Controllo');
        } else {
          cy.log('User is NOW logged in');
        }
      });
      cy.wait(1000);
      cy.visit('/');
      cy.wait(1000);
      cy.createConversation();
      cy.wait(1000);
    });
  });

  it('Should display the message input field', () => {
    cy.get(testData.selectors.messagebar.inputField).should('exist');
    cy.get(testData.selectors.messagebar.sendButton).should('exist');
  });

  it('Should update character counter when typing', () => {
    // Initial state should be 200
    cy.get(testData.selectors.messagebar.charCount).should('contain', '200');
    
    // Type a short message
    cy.get(testData.selectors.messagebar.inputField).type('Hello');
    cy.get(testData.selectors.messagebar.charCount).should('contain', '195');
    
    // Type a longer message
    cy.get(testData.selectors.messagebar.inputField).clear().type('This is a longer test message to verify the character counter works correctly');
    cy.get(testData.selectors.messagebar.charCount).should('contain', '123');
    
    // Clear the input
    cy.get(testData.selectors.messagebar.inputField).clear();
    cy.get(testData.selectors.messagebar.charCount).should('contain', '200');
  });

  it('Should prevent typing more than 200 characters', () => {
    const longMessage = 'a'.repeat(201);
    cy.get(testData.selectors.messagebar.inputField).type(longMessage, { delay: 0 });
    cy.get(testData.selectors.messagebar.inputField).invoke('val').then((text) => {
      expect(String(text).length).to.be.at.most(200);
    });
    cy.get(testData.selectors.messagebar.charCount).should('contain', '0');
  });

  it('Should detect forbidden words and disable send button', () => {
    cy.get(testData.selectors.messagebar.inputField).type(testData.messages.forbidden);
    
    cy.get(testData.selectors.messagebar.errorMessage).should('be.visible');
    cy.get(testData.selectors.messagebar.errorMessage).should('contain', 'Il messaggio contiene parole proibite');
    
    cy.get(testData.selectors.messagebar.sendButton).should('be.disabled');
    
    cy.get(testData.selectors.messagebar.inputField).clear().type('This is a valid message');
    cy.get(testData.selectors.messagebar.errorMessage).should('not.exist');
    cy.get(testData.selectors.messagebar.sendButton).should('not.be.disabled');
  });

  it('Should send message when clicking send button', () => {
    const testMessage = 'Test message for send button';
    cy.get(testData.selectors.messagebar.inputField).type(testMessage);
    cy.get(testData.selectors.messagebar.sendButton).click();
    
    // Verify message appears in chat
    cy.get(testData.selectors.chat.userMessage).should('contain', testMessage);
    
    // Input should be cleared after sending
    cy.get(testData.selectors.messagebar.inputField).should('have.value', '');
    
    // Character counter should reset
    cy.get(testData.selectors.messagebar.charCount).should('contain', '200');
  });

  it('Should send message when pressing Enter key', () => {
    const testMessage = 'Test message for Enter key';
    cy.get(testData.selectors.messagebar.inputField).type(testMessage + '{enter}');
    
    // Verify message appears in chat
    cy.get(testData.selectors.chat.userMessage).should('contain', testMessage);
    
    // Input should be cleared after sending
    cy.get(testData.selectors.messagebar.inputField).should('have.value', '');
  });

  it('Should handle special characters correctly', () => {
    cy.get(testData.selectors.messagebar.inputField).type(testData.messages.special);
    cy.get(testData.selectors.messagebar.sendButton).click();
    
    // Verify message with special chars appears correctly
    cy.get(testData.selectors.chat.userMessage).should('contain', testData.messages.special);
  });
});