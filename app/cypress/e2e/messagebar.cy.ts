describe('Messagebar Component Tests', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });

  //create a new conversation and select it
  beforeEach(() => {
    cy.loadTestData().then((data) => {
      testData = data;
      cy.visit('/');
      cy.performLogin(
        testData.users.admin.username, 
        testData.users.admin.password
      );
      cy.wait(testData.waitTimes.short); 
      cy.createConversation();
      cy.wait(testData.waitTimes.short);
      cy.selectConversation();
      cy.wait(testData.waitTimes.short);
    });
  });

  //after each test delete the conversation created

  afterEach(() => {
    cy.deleteFirstConversation();
  });

  it('Should display the message input field', () => {
    cy.get(testData.selectors.messagebar.inputField).should('exist');
    cy.get(testData.selectors.messagebar.sendButton).should('exist');
  });

  it('Should update character counter when typing', () => {

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
    cy.selectConversation();
    cy.wait(1000);
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
    cy.selectConversation();
    cy.wait(1000);
    cy.get(testData.selectors.messagebar.inputField).type(testMessage);
    cy.get(testData.selectors.messagebar.sendButton).click();
    cy.get(testData.selectors.chat.userMessage).should('contain', testMessage);
    cy.get(testData.selectors.messagebar.inputField).should('have.value', ''); 
    cy.get(testData.selectors.messagebar.charCount).should('contain', '200');
  });

  it('Should send message when pressing Enter key', () => {
    cy.selectConversation();
    cy.wait(1000);
    const testMessage = 'Test message for Enter key';
    cy.get(testData.selectors.messagebar.inputField).type(testMessage + '{enter}');
    cy.get(testData.selectors.chat.userMessage).should('contain', testMessage);
    cy.get(testData.selectors.messagebar.inputField).should('have.value', '');
  });

  it('Should handle special characters correctly', () => {
    cy.selectConversation();
    cy.wait(1000);
    cy.get(testData.selectors.messagebar.inputField).type(testData.messages.special);
    cy.get(testData.selectors.messagebar.sendButton).click();
    cy.get(testData.selectors.chat.userMessage).should('contain', testData.messages.special);
  });
});

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
      
    });
  });

  it('Should send and display messages', () => {
    cy.createConversation();
    cy.selectConversation();
    cy.sendMessage(testData.messages.standard);
    cy.get(testData.selectors.chat.userMessage).last().should('contain', testData.messages.standard);
    cy.get(testData.selectors.chat.botMessage, { timeout: 60000 }).last()
    .should('be.visible');
    cy.deleteFirstConversation();
  });

  it('Should maintain message history after page reload', () => {
    const testMessage = testData.messages.persistent; // Il messaggio da inviare
  
    // Crea una nuova conversazione
    cy.createConversation();
  
    // Seleziona la prima conversazione
    cy.selectConversation();
  
    // Assicurati che il campo di input sia visibile e pronto per l'interazione
    cy.get(testData.selectors.messagebar.inputField)
      .should('be.visible')
      .type(testMessage);
  
    // Assicurati che il bottone di invio sia visibile e abilitato
    cy.get(testData.selectors.messagebar.sendButton)
      .should('be.visible')
      .should('not.be.disabled')
      .click();
  
    cy.wait(1000); 
  
    cy.get(testData.selectors.chat.userMessage)
      .contains(testMessage)
      .should('exist');
  
    cy.reload();
    cy.selectConversation();
    cy.get(testData.selectors.chat.userMessage, { timeout: 10000 })
      .should('contain', testMessage);
    cy.deleteFirstConversation();
  });
  
  
});

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
      )
    });


    it('Should enforce character limit of 200', () => {
      cy.createConversation();
      cy.selectConversation();
      const longMessage = 'a'.repeat(201); //more than limit
      cy.get(testData.selectors.messagebar.inputField).type(longMessage);
      cy.get(testData.selectors.messagebar.charCount).should('contain', '0');
      cy.get(testData.selectors.messagebar.sendButton).should('be.not.disabled');
    });

    it('Should prevent sending messages with forbidden words', () => {
      cy.selectConversation();
      cy.get(testData.selectors.messagebar.inputField).type(testData.messages.forbidden);
      cy.get(testData.selectors.messagebar.errorMessage).should('be.visible');
      cy.get(testData.selectors.messagebar.sendButton).should('be.disabled');
    });

    it('Should enable send button only with valid message', () => {
      cy.selectConversation();
      cy.get(testData.selectors.messagebar.inputField).type('Valid test message');
      cy.get(testData.selectors.messagebar.sendButton).should('not.be.disabled')
      cy.get(testData.selectors.messagebar.sendButton).click();
      cy.get(testData.selectors.messagebar.inputField).should('be.empty');
      cy.get(testData.selectors.messagebar.charCount).should('contain', '200');
      cy.deleteFirstConversation();
    });
  });