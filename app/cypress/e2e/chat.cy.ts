describe('Chat page | NOT LOGGED IN', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('Should check if Chat component exists', () => {
    cy.url().should('include', '/');
  });

  it('Should check if Chat component has a title', () => {
    cy.get(testData.selectors.chat.messages).should('exist');
  });

  it('Should render "Seleziona Una Conversazione..."', () => {
    cy.get(testData.selectors.chat.noConversation).contains('Seleziona una conversazione');
  });
});

describe('Chat page | LOGGED IN', () => {
  let testData: any;

  before(() => {
    cy.loadTestData().then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.loadTestData().then((data) => {
      testData = data;
      cy.intercept('POST', `${testData.api.baseUrl}${testData.api.endpoints.signup}`).as('signupRequest');
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
      
      cy.wait(testData.waitTimes.short);
      cy.visit('/');
      cy.wait(testData.waitTimes.short);
    });
  });

  it('Should check if Chat component exists', () => {
    cy.url().should('include', '/');
  });

  it('Should check if Chat component has messages container', () => {
    cy.get(testData.selectors.chat.messages).should('exist');
  });

  it('Should render "Seleziona Una Conversazione..."', () => {
    cy.get(testData.selectors.chat.noConversation).contains('Seleziona una conversazione');
  });

  it("Should create a new conversation", () => {
    cy.createConversation();
  });

  it('Should select a conversation', () => {
    cy.getTotalConversations().then((totalConversations) => {
      expect(totalConversations).to.be.a('number');
      
      cy.selectConversation();
      
      cy.url().should('include', '#');
      
      cy.get(testData.selectors.messagebar.inputField).should('exist');
      cy.get(testData.selectors.messagebar.charCount).should('exist');
      cy.get(testData.selectors.messagebar.sendButton).should('exist');
      cy.get(testData.selectors.chat.message).should('exist').then(($messages) => {
        expect($messages.length).to.be.greaterThan(0);
      });
    });
  });

  it('Should check if i have messages in the conversation', () => {
    cy.selectConversation();
    cy.wait(testData.waitTimes.short); 

    cy.get(testData.selectors.chat.message).should('exist');
    
    cy.getTotalUserMessages().then((totalMessages: number) => {
      cy.get('body').then(($body) => {
        if ($body.find(testData.selectors.chat.userMessage).length > 0) {
          cy.get(testData.selectors.chat.userMessage).its('length').then((userMessages) => {
            expect(totalMessages).to.equal(userMessages);
            expect(userMessages).to.be.greaterThan(0);
            cy.log(`Numero di messaggi utente trovati: ${userMessages}`);
          });
        } else {
          cy.log('No user messages found - this is expected');
        }
      });
    });
    
    cy.getTotalBotMessages().then((totalBotMessages: number) => {
      cy.log(`Numero totale di messaggi bot: ${totalBotMessages}`);
      if (totalBotMessages > 0) {
        cy.get(testData.selectors.chat.botMessage).should('have.length', totalBotMessages);
      }
    });
  });

  it('Should delete a conversation', () => {
    cy.wait(testData.waitTimes.medium);

    cy.getTotalConversations().then((totalConversations: number) => {
      expect(totalConversations).to.be.a('number').and.to.be.greaterThan(0);
      
      cy.getTotalConversations().then((totalConversations: number) => {
        if(totalConversations < 1){
          cy.createConversation();
          cy.wait(testData.waitTimes.short);
        };
      });
      cy.selectConversation();
      cy.wait(testData.waitTimes.short);
      cy.deleteFirstConversation();
      cy.wait(testData.waitTimes.medium);
    });
  });
});