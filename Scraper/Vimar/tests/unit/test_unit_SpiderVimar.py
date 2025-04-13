import unittest
from unittest.mock import MagicMock
from scrapy.http import HtmlResponse
from Vimar.spiders.SpiderVimar import SpiderVimar


class TestSpiderVimarUnit(unittest.TestCase):
    def setUp(self):
        self.spider = SpiderVimar()

    def test_get_id(self):
        # Mock response for _getId
        mock_response = MagicMock()
        mock_response.css.return_value = [MagicMock(get=MagicMock(return_value="12345"))]
        result = self.spider._getId(mock_response)
        self.assertEqual(result, "12345")

    def test_get_name(self):
        # Mock response for _getName
        mock_response = MagicMock()
        mock_response.css.return_value = [
            MagicMock(get=MagicMock(return_value="First Strong")),
            MagicMock(get=MagicMock(return_value="Product Name"))
        ]
        result = self.spider._getName(mock_response)
        self.assertEqual(result, "Product Name")

    def test_get_description(self):
        # Mock response for _getDescription
        mock_response = MagicMock()
        mock_response.css.return_value = [
            MagicMock(get=MagicMock(return_value="First Paragraph")),
            MagicMock(get=MagicMock(return_value="Product Description"))
        ]
        result = self.spider._getDescription(mock_response)
        self.assertEqual(result, "Product Description")

    def test_get_etim(self):
        # Mock response for _getEtim
        mock_response = [MagicMock()]
        mock_response[0].css.return_value.get.return_value = "Key"
        mock_response[0].css.return_value.getall.return_value = ["Value"]
        result = self.spider._getEtim(mock_response)
        self.assertEqual(result, '{"Key": "Value"}')

    def test_get_pdfs(self):
        # Mock response for _getPDFs
        mock_response = [
            MagicMock(css=MagicMock(return_value=MagicMock(get=MagicMock(return_value="file1IT.pdf")))),
            MagicMock(css=MagicMock(return_value=MagicMock(get=MagicMock(return_value="file2.pdf")))),
        ]
        result = self.spider._getPDFs(mock_response)
        self.assertEqual(result, ["file1IT.pdf"])

    def test_get_faq(self):
        # Mock response for _getFaq
        mock_response = MagicMock()
        mock_response.css.return_value = MagicMock(getall=MagicMock(return_value=["Question 1", "Question 2"]))
        result = self.spider._getFaq(mock_response)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["question"], "Question 1")

    def test_get_link_to_products(self):
        # Mock response for _getLinkToProducts
        mock_response = MagicMock()
        mock_response.css.return_value.getall.return_value = ["/product1", "/product2"]
        result = self.spider._getLinkToProducts(mock_response)
        self.assertEqual(result, ["/product1", "/product2"])

    def test_get_link_next_page(self):
        # Mock response for _getlinkNextPage
        mock_response = MagicMock()
        mock_response.css.side_effect = [
            MagicMock(get=MagicMock(return_value="1")),  # Current page
            MagicMock(get=MagicMock(return_value="/nextpage")),  # Next page link
        ]
        result = self.spider._getlinkNextPage(mock_response)
        self.assertEqual(result, "/nextpage")


if __name__ == "__main__":
    unittest.main()