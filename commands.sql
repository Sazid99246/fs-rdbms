CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes)
VALUES (
    'Sheikh Md. Sazidul Islam',
    'https://www.example.com',
    'HTML is easy',
    10
);

INSERT INTO blogs (author, url, title, likes)
VALUES (
    'Sanja Islam Lazz',
    'https://www.example.com',
    'CSS is hard',
    20
);
