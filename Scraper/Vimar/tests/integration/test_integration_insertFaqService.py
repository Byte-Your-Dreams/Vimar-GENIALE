import unittest
from Vimar.services.insertFaqService import InsertFaqService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.models.faq import Faq
from Vimar.ports.insertFaqPort import InsertFaqPort

class RealInsertFaqPort(InsertFaqPort):
    def insert_faq(self, faq: Faq):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        if faq.get_productID() == "1" and faq.get_question() == "What is the return policy?":
            return DbInsertOperationResponse(success=True, message="FAQ inserted successfully")
        else:
            raise Exception("Failed to insert FAQ")

class TestInsertFaqServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of InsertFaqPort
        self.real_port = RealInsertFaqPort()
        self.service = InsertFaqService(self.real_port)

    def test_insert_faq_success(self):
        # Create a real Faq object
        faq = Faq(productID='1',question="What is the return policy?", answer="You can return items within 30 days.")

        # Call the service method
        response = self.service.insert_faq(faq)

        # Assertions
        self.assertIsInstance(response, DbInsertOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "FAQ inserted successfully")

    def test_insert_faq_failure(self):
        # Create a Faq object that will cause a failure
        faq = Faq(productID='1', question="Invalid question", answer="Invalid answer")

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            self.service.insert_faq(faq)
        self.assertEqual(str(context.exception), "Failed to insert FAQ")

if __name__ == '__main__':
    unittest.main()