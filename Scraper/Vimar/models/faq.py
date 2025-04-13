class Faq:
    def __init__(self, productID: str, question: str, answer: str):
        self.productID = productID
        self.question = question
        self.answer = answer
    
    def get_productID(self) -> str:
        return self.productID
    
    def get_question(self) -> str:
        return self.question
    
    def get_answer(self) -> str:
        return self.answer