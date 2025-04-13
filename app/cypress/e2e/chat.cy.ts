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

  it('Should create a new conversation', () => {
    cy.getTotalConversations().then((totalConversations: number) => {
      expect(totalConversations).to.be.a('number').and.to.be.greaterThan(0);

      cy.selectConversation();

      cy.createConversation();
      cy.wait(1000);
      
      if (totalConversations > 2) {
        expect(cy.get('.sidebarError')).to.exist;
      } else {
        cy.getTotalConversations().then((newTotalConversations: number) => {
          expect(newTotalConversations).to.be.a('number').and.to.be.greaterThan(totalConversations);
        });
      }
    });
  });

  it('Should delete a conversation', () => {
    cy.getTotalConversations().then((totalConversations: number) => {
      expect(totalConversations).to.be.a('number').and.to.be.greaterThan(0);

      
      cy.getTotalConversations().then((totalConversations: number) => {
        if(totalConversations <1){
          cy.createConversation();
          cy.wait(1000);
        };
      });

      cy.selectConversation();
      cy.wait(1000);

      cy.deleteFirstConversation();
      
      cy.wait(2000);

      cy.getTotalConversations().then((newTotalConversations: number) => {
        expect(newTotalConversations).to.be.a('number').and.to.be.lessThan(totalConversations);
      });
    });
  });

  it('Should select a conversation', () => {
    cy.selectConversation();
  });

  it('Should check if i have messages in the conversation', () => {
    cy.selectConversation();
    cy.wait(1000); 

    cy.get('.message').should('exist');

    cy.getTotalUserMessages().then((totalMessages: number) => {
      cy.get('body').then(($body) => {
        if ($body.find(testData.selectors.chat.userMessage).length > 0) {
          //element exists
          cy.get(testData.selectors.chat.userMessage).its('length').then((userMessages) => {
            expect(totalMessages).to.equal(userMessages);
          });
        } else {
          //element does not exist
          cy.log('No user messages found - this is expected');
        }
      });
    });
  });
});
