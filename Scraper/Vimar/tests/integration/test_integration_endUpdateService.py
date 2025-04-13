import unittest
from Vimar.services.endUpdateService import EndUpdateService
from Vimar.models.dbInsertOperationResponse import DbInsertOperationResponse
from Vimar.ports.endUpdatePort import EndUpdatePort

class RealEndUpdatePort(EndUpdatePort):
    def end_update(self):
        # Simulate a real implementation of the port
        # Replace this with actual logic for integration testing
        return DbInsertOperationResponse(success=True, message="Update ended successfully")

class TestEndUpdateServiceIntegration(unittest.TestCase):
    def setUp(self):
        # Use the real implementation of EndUpdatePort
        self.end_update_port = RealEndUpdatePort()
        self.service = EndUpdateService(self.end_update_port)

    def test_end_update_success(self):
        # Call the service method
        response = self.service.end_update()

        # Assertions
        self.assertIsInstance(response, DbInsertOperationResponse)
        self.assertTrue(response.get_success())
        self.assertEqual(response.get_message(), "Update ended successfully")

    def test_end_update_failure(self):
        # Simulate a failure scenario by overriding the port's behavior
        class FailingEndUpdatePort(EndUpdatePort):
            def end_update(self):
                raise Exception("Database error")

        # Replace the port with the failing implementation
        failing_service = EndUpdateService(FailingEndUpdatePort())

        # Call the service method and assert it raises an exception
        with self.assertRaises(Exception) as context:
            failing_service.end_update()
        self.assertEqual(str(context.exception), "Database error")

if __name__ == '__main__':
    unittest.main()