FROM swift:5.8

WORKDIR /app

COPY . .

RUN swift build

CMD ["swift", "run"]
