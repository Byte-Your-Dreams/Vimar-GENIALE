FROM python:3.12-slim

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN apt update && apt install -y tesseract-ocr tesseract-ocr-ita ghostscript && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY scrapyd.conf /etc/scrapyd/

EXPOSE 6800
CMD ["scrapyd"]