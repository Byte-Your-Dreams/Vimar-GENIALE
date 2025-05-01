describe("Sidebar page | NOT LOGGED IN", () => {
    let testData: any;

    before(() => {
        cy.loadTestData().then((data) => {
            testData = data;
        });
    });

    beforeEach(() => {
        cy.visit("/");
    });

    it("Should render Sidebar component", () => {
        cy.url().should("include", "/");
    });

    it("Should check if Sidebar component exists", () => {
        cy.get(testData.selectors.sidebar.container).should("exist");
    });

    it('Should check if Sidebar component has "Nuova Chat" button', () => {
        cy.get(testData.selectors.chat.newChatButton).contains("Nuova chat");
    });

    it('Should check if Sidebar component has NOT "Chat Container" container', () => {
        cy.get(testData.selectors.sidebar.chatContainer).should(
            "not.contain",
            "Chat Container",
        );
    });
});

describe("Sidebar page | LOGGED IN", () => {
    let testData: any;

    before(() => {
        cy.loadTestData().then((data) => {
            testData = data;
        });
    });

    beforeEach(() => {
        cy.loadTestData().then((data) => {
            testData = data;
            cy.intercept(
                "POST",
                `${testData.api.baseUrl}${testData.api.endpoints.signup}`,
            ).as("signupRequest");
            cy.visit("/");
            cy.performLogin(
                testData.users.admin.username,
                testData.users.admin.password,
            ).then((isLogged: boolean) => {
                cy.log(`Login status: ${isLogged}`);
                if (isLogged) {
                    cy.visit("/dashboard");
                    cy.contains("Pannello di Controllo");
                } else {
                    cy.log("User is NOW logged in");
                }
            });
            cy.wait(testData.waitTimes.short);
            cy.visit("/");
            cy.wait(testData.waitTimes.short);
        });
    });

    it("Should check if Chat component exists", () => {
        cy.url().should("include", "/");
    });

    it("Should create a new conversation", () => {
        cy.createConversation();
    });

    it("Should allow deleting a conversation", () => {
        cy.getTotalConversations().then((totalConversations: number) => {
            if (totalConversations > 0) {
                cy.selectConversation();
                cy.wait(testData.waitTimes.medium);
                cy.get(".chatContainer .chatID").first().then(($chatItem) => {
                    if ($chatItem.find(".delete-icon").length > 0) {
                        cy.get(".chatContainer .chatID").first().find(
                            ".delete-icon",
                        ).click();
                    } else if (
                        $chatItem.find('[data-cy="delete-chat"]').length > 0
                    ) {
                        cy.get(".chatContainer .chatID").first().find(
                            '[data-cy="delete-chat"]',
                        ).click();
                    } else if (
                        $chatItem.find('button:contains("Delete")').length > 0
                    ) {
                        cy.get(".chatContainer .chatID").first().find(
                            'button:contains("Delete")',
                        ).click();
                    } else if (
                        $chatItem.find('button:contains("Elimina")').length > 0
                    ) {
                        cy.get(".chatContainer .chatID").first().find(
                            'button:contains("Elimina")',
                        ).click();
                    } else {
                        cy.get(".chatContainer .chatID").first().find(
                            "button, .icon",
                        ).first().click();
                    }
                });
            } else {
                cy.log("No conversations available to delete");
            }
        });
    });
});
