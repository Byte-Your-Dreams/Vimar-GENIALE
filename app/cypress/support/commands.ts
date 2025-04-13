import { environment } from '../../src/environments/environment';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      sendMessage(message: string): Chainable<void>;
      getTotalConversations(): Chainable<number>;
      createConversation(): Chainable<void>;
      checkConversationTitle(): Chainable<string>;
      performLogin(username: string, password: string): Chainable<boolean>;
      performApiLogin(email: string, password: string, expect_status: number): Chainable<Cypress.Response<any>>;
      loadTestData(): Chainable<any>;
      getTotalUserMessages(): Chainable<number>;
      getTotalBotMessages(): Chainable<number>;
      selectConversation(): Chainable<void>;
      deleteFirstConversation(): Chainable<void>;
    }
  }
}

// Add a command to load test data
Cypress.Commands.add('loadTestData', () => {
  return cy.fixture('testData').then(testData => {
    return cy.wrap(testData);
  });
});

Cypress.Commands.add('getTotalConversations', () => {
  return cy.loadTestData().then(testData => {
    return cy.get(`${testData.selectors.sidebar.chatContainer} > *`)
      .then($elements => {
        return cy.wrap($elements.length);
      });
  });
});

Cypress.Commands.add('createConversation', () => {
  return cy.loadTestData().then(testData => {
    cy.get(testData.selectors.chat.newChatButton).click();
    cy.wait(3000);
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
        // Clear the field first and add a small delay before typing
        cy.get(testData.selectors.login.emailInput).clear().wait(300);
        // Type with a slower typing speed
        cy.get(testData.selectors.login.emailInput).type(username, { delay: 100 });
        cy.wait(500); // Wait to ensure typing is complete
        
        cy.get(testData.selectors.login.passwordInput).clear().type(password, { delay: 50 });
        cy.wait(500); // Wait before clicking the button
        
        cy.get(testData.selectors.login.loginButton).click();
        cy.wait(2000); // Wait for navigation

        return cy.url().then((url) => {
          const isLogged = !url.includes('/login');
          return cy.wrap(isLogged);
        });
      });
  });
});

Cypress.Commands.add('performApiLogin', (email: string, password: string, expect_status: number) => {
  return cy.loadTestData().then(testData => {
    return cy.request({
      method: 'POST',
      url: testData.api.supabaseUrl,
      headers: {
        apikey: environment.supabaseKey,
        Authorization: `Bearer ${environment.supabaseKey}`
      },
      body: {
        email,
        password,
        gotrue_meta_security: {}
      },
      failOnStatusCode: false
    }).then((response) => {
      cy.wrap(response).its('status').should('eq', expect_status);
      // expect(response.status).to.eq(expect_status);
      return cy.wrap(response);
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

Cypress.Commands.add('sendMessage', (message: string) => {
  return cy.loadTestData().then(testData => {
    if (!message) {
      throw new Error('Empty message');
    }
    if (message.length > 1000) {
      throw new Error('Message too long');
    }
    
    cy.get('body').then($body => {
      if ($body.find(testData.selectors.messagebar.inputField).length > 0) {
        cy.get(testData.selectors.messagebar.inputField).type(message);
        cy.get(testData.selectors.messagebar.sendButton).click();
      } else {
        cy.log('Message input field not found');
      }
    });
  });
});


Cypress.Commands.add('deleteFirstConversation', () => {
  return cy.loadTestData().then(testData => {
    cy.get('body').then($body => {
      if ($body.find(testData.selectors.sidebar.chatContainer + ' > *').length > 0) {
        // Find and click the delete button for the first conversation
        
        // Select the first conversation before deleting
        cy.get(testData.selectors.sidebar.chatContainer + ' > *')
          .first()
          .find('a')
          .click();
        cy.wait(500);


        cy.get(testData.selectors.sidebar.chatContainer + ' > *')
          .first()
          .find(testData.selectors.chat.deleteButton)
          .click();

        // Wait for deletion to complete
        cy.wait(1000);
      } else {
        cy.log('No conversations to delete');
      }
    });
  });
})