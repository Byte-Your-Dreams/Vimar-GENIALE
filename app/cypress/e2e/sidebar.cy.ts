describe('Sidebar page | NOT LOGGED IN', () => {

    let testData: any;

    before(() => {
      cy.loadTestData().then((data) => {
        testData = data;
      });
    });

    beforeEach(() => {
        cy.visit('/');
    });

    it('Should render Sidebar component', () => {
        cy.url().should('include', '/');
    });

    it('Should check if Sidebar component exists', () => {
        cy.get(testData.selectors.sidebar.container).should('exist');
    });

    it('Should check if Sidebar component has "New Chat" button', () => {
        cy.get(testData.selectors.chat.newChatButton).contains('Nuova Chat');
    });

    it('Should check if Sidebar component has NOT "Chat Container" container', () => {
        cy.get(testData.selectors.sidebar.chatContainer).should('not.contain', 'Chat Container');
    });
});

describe('Login button', () => {

    let testData: any;

    before(() => {
      cy.loadTestData().then((data) => {
        testData = data;
      });
    });

    beforeEach(() => {
        cy.visit('/');
    });

    it('Should click on "Login" button', () => {
        cy.get(testData.selectors.sidebar.signInOutButton).click();
        cy.url().should('include', '/login');
    });
});


describe('Sidebar page | LOGGED IN', () => {

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
        ).then((isLogged : boolean) => {
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

    it('Should check if Chat component exists', () => {
        cy.url().should('include', '/');
    });

    it('Should check if Sidebar component exists', () => {
        cy.get(testData.selectors.sidebar.container).should('exist');
    });

    it('Should check if Sidebar component has "New Chat" button', () => {
        cy.get(testData.selectors.chat.newChatButton).contains('New Chat');
    });
    
    it('Should create a new conversation', () => {
        cy.getTotalConversations().then((totalConversations : number) => {
            expect(totalConversations).to.be.a('number').and.to.be.greaterThan(0);

            cy.createConversation();
            cy.wait(1000);

            cy.getTotalConversations().then((newTotalConversations : number) => {
                expect(newTotalConversations).to.be.a('number').and.to.be.greaterThan(totalConversations);
            });
        });
    });

    it('Should check conversation title', () => {
        cy.checkConversationTitle().then((title : string) => {
            expect(title).to.not.be.empty;
        });
    });

    it('Should delete a selected conversation', () => {
        cy.get(`${testData.selectors.sidebar.chatContainer} > li:last-child`).click();
        cy.get(testData.selectors.chat.deleteButton).click({ force: true });
        cy.wait(1000);
        cy.get(testData.selectors.sidebar.chatContainer).should('not.contain', 'Delete');
    });

    it('Should check if conversation text is the same as .chat-header h2', () => {
        cy.get(`${testData.selectors.sidebar.chatContainer} > li:last-child`).click();
        cy.wait(500);
        cy.get(`${testData.selectors.chat.header} h2`).invoke('text').then((headerText) => {
            cy.get(`${testData.selectors.sidebar.chatContainer} a`).first().invoke('text').then((conversationText) => {
                // Trim both texts to handle whitespace differences
                const trimmedHeaderText = headerText.trim();
                const trimmedConversationText = conversationText.trim();

                // Check if one contains the other (partial match)
                expect(
                    trimmedHeaderText.includes(trimmedConversationText) || 
                    trimmedConversationText.includes(trimmedHeaderText)
                ).to.be.true;
            });
        });
    });
});