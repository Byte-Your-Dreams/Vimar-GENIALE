import os, unittest, json, logging
from unittest.mock import MagicMock, patch
from scrapy.http import HtmlResponse, Request
from Vimar.spiders.SpiderVimar import SpiderVimar
from Vimar.items import ProductItem

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
class TestSpiderVimar(unittest.TestCase):
    def setUp(self):
        self.spider = SpiderVimar()

    def load_html_response(self, file_name, url="https://www.vimar.com"):
        """Helper method to load an HTML file and create a Scrapy HtmlResponse."""
        file_path = os.path.join(os.path.dirname(__file__), file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            body = f.read()
        return HtmlResponse(url=url, body=body, encoding="utf-8")

    def test_start_requests(self):
        start_urls = [
            "https://www.vimar.com/it/it/catalog/product/index/liv/A0L102?page=1",
            "https://www.vimar.com/it/it/catalog/product/index/liv/B0L110?page=1"
        ]
        requests = list(self.spider.start_requests())
        self.assertEqual(len(requests), len(start_urls))
        for i, request in enumerate(requests):
            self.assertEqual(request.url, start_urls[i])
            self.assertEqual(request.callback, self.spider._navigation)

    def test_navigation(self):
        response = self.load_html_response("../test_navigation_page.html")
        requests = list(self.spider._navigation(response))

        self.assertEqual(len(requests), 25)  # 24 product links + 1 next page link
        product_links = [r.url for r in requests if r.callback == self.spider._parseProduct]
        next_page_links = [r.url for r in requests if r.callback == self.spider._navigation]

        self.assertIn("https://www.vimar.com/it/it/catalog/product/index/code/01817", product_links)
        self.assertIn("https://www.vimar.com/it/it/catalog/product/index/liv/A0L102?page=2", next_page_links)

    def test_parse_product(self):
        response = self.load_html_response("../test_product_page.html")
        results = list(self.spider._parseProduct(response))

        self.assertEqual(len(results), 1)
        item = results[0]
        self.assertIsInstance(item, ProductItem)
        self.assertEqual(item["ID"], "02973.M")
        self.assertEqual(item["Nome"], "Termostato rotella connesso IoT2M Metal")
        self.assertTrue(item["Descrizione"].startswith("Termostato a rotella con uscita a relè"))
        self.assertIn("Gruppo", json.loads(item["ETIM"]))
        self.assertIn("Classe", json.loads(item["ETIM"]))
        self.assertEqual(len(item["Faq"]), 0)
        self.assertEqual(
            item["files_urls"],
            ["https://www.vimar.com/irj/go/km/docs/z_catalogo/DOCUMENT/ZIS_30810.109914.x-02973IT_FI.pdf"],
        )

    def test_get_id(self):
        response = self.load_html_response("../test_product_page.html")
        result = self.spider._getId(response.css("div#catalog-detail div div p"))
        self.assertEqual(result, "02973.M")

    def test_get_name(self):
        response = self.load_html_response("../test_product_page.html")
        result = self.spider._getName(response.css("div#catalog-detail div div p"))
        self.assertEqual(result, "Termostato rotella connesso IoT2M Metal")

    def test_get_description(self):
        response = self.load_html_response("../test_product_page.html")
        result = self.spider._getDescription(response.css("div#catalog-detail div div p"))
        self.assertTrue(result.startswith("Termostato a rotella con uscita a relè"))

    def test_get_etim(self):
        response = self.load_html_response("../test_product_page.html")
        result = json.loads(self.spider._getEtim(response.css("div#pills-etim div div")))
        self.assertEqual(result["Gruppo"], "Attrezzatura ricettiva e di processo")
        self.assertEqual(result["Classe"], "Termostato/regolatore di temperatura ambiente")

    def test_get_pdfs(self):
        response = self.load_html_response("../test_product_page.html")
        result = self.spider._getPDFs(
            response.css('div#pills-download h4:contains("Istruzioni, Manuali, Documentazione") + ul li')
        )
        self.assertEqual(
            result,
            ["https://www.vimar.com/irj/go/km/docs/z_catalogo/DOCUMENT/ZIS_30810.109914.x-02973IT_FI.pdf"],
        )

    def test_get_faq(self):
        response = self.load_html_response("../test_product_page.html")
        result = self.spider._getFaq(response.css("#pills-faq"))
        self.assertEqual(len(result), 0)  # No FAQs in the test file

    def test_get_link_to_products(self):
        response = self.load_html_response("../test_navigation_page.html")
        result = self.spider._getLinkToProducts(response)
        self.assertEqual(len(result), 24)  # 24 product links
        self.assertIn("/it/it/catalog/product/index/code/01817", result)
        self.assertIn("/it/it/catalog/product/index/code/02973.M", result)

    def test_get_link_next_page(self):
        response = self.load_html_response("../test_navigation_page.html")
        result = self.spider._getlinkNextPage(response)
        self.assertEqual(result, "/it/it/catalog/product/index/liv/A0L102?page=2")

    def test_parse_product_no_pdfs(self):
        response = self.load_html_response("../test_last_product_page_wo_pdfs_and_faq.html")
        results = list(self.spider._parseProduct(response))
        self.assertEqual(len(results), 1)
        item = results[0]
        self.assertEqual(item['files_urls'], [])  # FAQ vuote

if __name__ == "__main__":
    unittest.main()