CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     name VARCHAR(255),
                                     email VARCHAR(255) UNIQUE,
                                     google_id TEXT UNIQUE
);
DROP TABLE IF EXISTS access_tokens;

CREATE TABLE access_tokens (
                               id SERIAL PRIMARY KEY,
                               user_id INT REFERENCES users(id) ON DELETE CASCADE,
                               access_token TEXT NOT NULL,
                               refresh_token TEXT,
                               expires_in BIGINT,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE  TABLE IF NOT EXISTS base_url(
    id serial PRIMARY KEY,
    base_url varchar(255),
    file_type varchar(255)
);