import { environment } from '../../src/environments/environment';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      sendMessage(message: string): Chainable<void>;
      getTotalConversations(): Chainable<number>;
      createConversation(): Chainable<void>;
      checkConversationTitle(): Chainable<string>;
      performLogin(username: string, password: string): Chainable<boolean>;
      loadTestData(): Chainable<any>;
      getTotalUserMessages(): Chainable<number>;
      getTotalBotMessages(): Chainable<number>;
      selectConversation(): Chainable<void>;
      deleteFirstConversation(): Chainable<void>;
      mockApiResponses(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loadTestData', () => {
  return cy.fixture('testData').then(testData => {
    return cy.wrap(testData);
  });
});

Cypress.Commands.add('getTotalConversations', () => {
  return cy.loadTestData().then(testData => {
    cy.get(`${testData.selectors.sidebar.chatContainer} > *`, { timeout: 10000 })
      .should('exist')  // Verifica che l'elemento esista, ma non necessariamente visibile
      .then($elements => {
        const numberOfConversations = $elements.length;  // Controlla il numero di conversazioni
        return cy.wrap(numberOfConversations);  // Restituisci la lunghezza
      });
  });
});

Cypress.Commands.add('createConversation', () => {
  return cy.loadTestData().then(testData => {
    cy.get(testData.selectors.chat.newChatButton).click();

    cy.wait(testData.waitTimes.medium);

    cy.get("body").then(($body) => {
      if ($body.find(testData.selectors.chat.sidebarError).length > 0) {
        cy.get(testData.selectors.chat.sidebarError).should("exist");
      }
    });
  });
});

Cypress.Commands.add('checkConversationTitle', () => {
  return cy.loadTestData().then(() => {
    let headerText = '';
    cy.get('a').first().click();
    cy.get('h2').invoke('text').then((text) => {
      headerText = text;
      cy.get('a').invoke('text').then((conversationText) => {
        if (conversationText === 'nuova conversazione') {
          headerText = 'Seleziona una conversazione';
        }
        expect(headerText).to.eq(conversationText);
        return cy.wrap(headerText);
      });
    });
  });
});

Cypress.Commands.add('getTotalUserMessages', () => {
  return cy.loadTestData().then(testData => {
    return cy.get('body').then($body => {
      if ($body.find(testData.selectors.chat.userMessage).length > 0) {
        return cy.get(testData.selectors.chat.userMessage).then($messages => {
          return cy.wrap($messages.length);
        });
      } else {
        return cy.wrap(0);
      }
    });
  });
});

Cypress.Commands.add('getTotalBotMessages', () => {
  return cy.loadTestData().then(testData => {
    return cy.get('body').then($body => {
      if ($body.find(testData.selectors.chat.botMessage).length > 0) {
        return cy.get(testData.selectors.chat.botMessage).then($messages => {
          return cy.wrap($messages.length);
        });
      } else {
        return cy.wrap(0);
      }
    });
  });
});

Cypress.Commands.add('performLogin', (username: string, password: string) => {
  return cy.loadTestData().then(testData => {
    return cy.visit('/login')
      .then(() => {

        cy.wait(2000);
        cy.get(testData.selectors.login.emailInput).clear().wait(300);

        cy.get(testData.selectors.login.emailInput).type(username, { delay: 100 });
        cy.wait(500);
        
        cy.get(testData.selectors.login.passwordInput).clear().type(password, { delay: 50 });
        cy.wait(500);
        
        cy.get(testData.selectors.login.loginButton).click();
        cy.wait(2000);

        return cy.url().then((url) => {
          const isLogged = !url.includes('/login');
          return cy.wrap(isLogged);
        });
      });
  });
});


Cypress.Commands.add('selectConversation', () => {
  return cy.loadTestData().then(testData => {
    cy.getTotalConversations().then((totalConversations: number) => {
      if (totalConversations === 0) {
        cy.createConversation();
        cy.wait(1000);
      }
    });

    cy.get('body').then($body => {
      if ($body.find(':nth-child(1) > .chatID > a').length > 0) {
        cy.get(':nth-child(1) > .chatID > a').click();
        cy.get(testData.selectors.messagebar.inputField).should('exist');
        cy.get(testData.selectors.messagebar.charCount).should('exist');
        cy.get(testData.selectors.messagebar.sendButton).should('exist');
        cy.get('.message').should('exist');
      } else {
        cy.log('No conversations found to select');
      }
    });
  });
});

Cypress.Commands.add('performLogin', (username: string, password: string) => {
  return cy.loadTestData().then(testData => {

    cy.intercept('POST', '**/auth/v1/token?grant_type=password').as('loginRequest');
    cy.intercept('GET', '**/auth/v1/user').as('getUserRequest');
    cy.intercept('GET', '**/rest/v1/get_all_conversations*').as('getConversationsRequest');
    
    return cy.visit('/login')
      .then(() => {
        cy.wait(2000);
        cy.get(testData.selectors.login.emailInput).clear().wait(300);
        cy.get(testData.selectors.login.emailInput).type(username, { delay: 100 });
        cy.wait(500);
        
        cy.get(testData.selectors.login.passwordInput).clear().type(password, { delay: 50 });
        cy.wait(500);
        
        cy.get(testData.selectors.login.loginButton).click();
        
        cy.wait('@loginRequest').then((interception) => {
          const statusCode = interception.response?.statusCode;
          if (statusCode === 200) {
            cy.wait('@getUserRequest');
            cy.wait('@getConversationsRequest');
          }
        });
        
        cy.wait(2000);
        return cy.url().then((url) => {
          const isLogged = !url.includes('/login');
          return cy.wrap(isLogged);
        });
      });
  });
});

Cypress.Commands.add('sendMessage', (message: string) => {
  return cy.loadTestData().then(testData => {
    if (!message) {
      throw new Error('Empty message');
    }
    if (message.length > 1000) {
      throw new Error('Message too long');
    }
    
    cy.intercept('POST', '**/rest/v1/messaggio*').as('sendMessageRequest');
    
    cy.get('body').then($body => {
      if ($body.find(testData.selectors.messagebar.inputField).length > 0) {
        cy.get(testData.selectors.messagebar.inputField).type(message);
        cy.get(testData.selectors.messagebar.sendButton).click();
        
        cy.wait('@sendMessageRequest').then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        });
      } else {
        cy.log('Message input field not found');
      }
    });
  });
});

Cypress.Commands.add('deleteFirstConversation', () => {
  return cy.loadTestData().then(testData => {
    cy.intercept('DELETE', '**/rest/v1/chat*').as('deleteConversationRequest');
    
    cy.get('body').then($body => {
      if ($body.find(testData.selectors.sidebar.chatContainer + ' > *').length > 0) {
        
        cy.get(testData.selectors.sidebar.chatContainer + ' > *')
          .first()
          .find('a')
          .click();
        cy.wait(500);

        cy.get(testData.selectors.sidebar.chatContainer + ' > *')
          .first()
          .find(testData.selectors.chat.deleteButton)
          .click();

        cy.wait('@deleteConversationRequest').then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 204]); 
        });
        
        cy.wait(1000);
      } else {
        cy.log('No conversations to delete');
      }
    });
  });
});

Cypress.Commands.add('sendMessage', (message: string) => {
  return cy.loadTestData().then(testData => {
    if (!message) {
      throw new Error('Empty message');
    }
    if (message.length > 1000) {
      throw new Error('Message too long');
    }
    
    cy.intercept('POST', '**/rest/v1/messaggio*').as('sendMessageRequest');
    
    cy.get('body').then($body => {
      if ($body.find(testData.selectors.messagebar.inputField).length > 0) {
        cy.get(testData.selectors.messagebar.inputField).type(message);
        cy.get(testData.selectors.messagebar.sendButton).click();
        
        cy.wait('@sendMessageRequest').then((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        });
      } else {
        cy.log('Message input field not found');
      }
    });
  });
});

Cypress.Commands.add('mockApiResponses', () => {
  return cy.loadTestData().then(testData => {

    cy.intercept('POST', `**${testData.api.endpoints.login}`, {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: 'admin@placeholder.com'
        }
      }
    }).as('loginApi');

    cy.intercept('GET', `**${testData.api.endpoints.conversations}*`, {
      statusCode: 200,
      body: [
        { id: 'mock-chat-1', utente: 'mock-user-id', created_at: new Date().toISOString(), title: 'Mock Conversation 1' },
        { id: 'mock-chat-2', utente: 'mock-user-id', created_at: new Date().toISOString(), title: 'Mock Conversation 2' }
      ]
    }).as('getConversations');

    cy.intercept('POST', `**${testData.api.endpoints.chat}*`, {
      statusCode: 201,
      body: [
        { id: 'new-mock-chat', utente: 'mock-user-id', created_at: new Date().toISOString() }
      ]
    }).as('createConversation');

    cy.intercept('POST', `**${testData.api.endpoints.message}*`, {
      statusCode: 201,
      body: {
        id: 'mock-message-id',
        chat: 'mock-chat-1',
        domanda: 'Test message with mocked API',
        risposta: 'Mocked response from the API',
        created_at: new Date().toISOString()
      }
    }).as('sendMessage');

    cy.intercept('DELETE', `**${testData.api.endpoints.chat}*`, {
      statusCode: 200,
      body: {}
    }).as('deleteConversation');

    cy.intercept('PATCH', `**${testData.api.endpoints.message}*`, {
      statusCode: 200,
      body: {}
    }).as('submitFeedback');

    cy.intercept('POST', `**${testData.api.endpoints.analytics.feedbackMessages}`, {
      statusCode: 200,
      body: [
        { positive_feedback_mex: 10, negative_feedback_mex: 5, neutral_feedback_mex: 15 }
      ]
    }).as('getFeedbackMessages');

    cy.intercept('POST', `**${testData.api.endpoints.analytics.feedbacks}`, {
      statusCode: 200,
      body: [
        { week_number: 1, positive_feedback: 5, negative_feedback: 2 },
        { week_number: 2, positive_feedback: 8, negative_feedback: 3 }
      ]
    }).as('getFeedbacks');

    cy.intercept('POST', `**${testData.api.endpoints.analytics.messagesPerWeek}`, {
      statusCode: 200,
      body: [
        { numberofweek: 1, numberofmessages: 20 },
        { numberofweek: 2, numberofmessages: 35 }
      ]
    }).as('getMessagesPerWeek');

    cy.intercept('POST', `**${testData.api.endpoints.analytics.analyzeMessages}`, {
      statusCode: 200,
      body: {
        averageWords: 15,
        wordCounts: [
          { word: 'test', count: 10 },
          { word: 'mock', count: 8 },
          { word: 'api', count: 6 }
        ]
      }
    }).as('analyzeMessages');
  });
});