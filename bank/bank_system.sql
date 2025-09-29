-- USERS Table
CREATE TABLE IF NOT EXISTS USERS(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number VARCHAR(10),
    created_at TEXT DEFAULT (DATETIME('NOW'))
);

-- ACCOUNTS Table
CREATE TABLE ACCOUNTS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- internal PK
    user_id INTEGER NOT NULL,               -- FK to USERS
    account_number INTEGER UNIQUE,          -- must be unique, generated in Node.js
    account_type TEXT NOT NULL CHECK(account_type IN('SAVINGS','CURRENT')),
    balance REAL NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,           -- 1 = active, 0 = inactive
    created_at TEXT DEFAULT (DATETIME('NOW')),
    FOREIGN KEY(user_id) REFERENCES USERS(user_id)
);



-- TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS TRANSACTIONS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    account_number INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN('DEPOSIT','WITHDRAW','TRANSFER-IN','TRANSFER-OUT')), 
    amount REAL,
    description TEXT,
    timestamp TEXT DEFAULT (DATETIME('NOW')),
    balance_after REAL NOT NULL,
    FOREIGN KEY(account_number) REFERENCES ACCOUNTS(account_number)
);
DROP TABLE IF EXISTS ACCOUNTS;


SELECT * FROM USERS;

SELECT * FROM ACCOUNTS;

SELECT * FROM TRANSACTIONS;

INSERT INTO USERS (full_name,email,phone_number) values ('Srushti Amin', 'srushtiamin2@gmail.com', 9173480640);
INSERT INTO USERS (full_name,email,phone_number) values ('John Doe', 'john@gmail.com', 1234567890);

ALTER TABLE ACCOUNTS
DROP COLUMN customer_name;

INSERT into ACCOUNTS (user_id,account_number,account_type,balance) values (1, 1001 ,'SAVINGS', 5000);
INSERT into ACCOUNTS (user_id,account_number,account_type,balance) values (1, 1002 ,'CURRENT', 5000);
INSERT into ACCOUNTS (user_id,account_number,account_type,balance) values (2, 1003 ,'SAVINGS', 1000);

SELECT * FROM ACCOUNTS WHERE user_id=1;
SELECT * FROM USERS WHERE user_id=1;



INSERT INTO TRANSACTIONS (account_number, type, amount, description,balance_after)
VALUES (1001, 'DEPOSIT', 1000, 'Initial deposit',6000);

INSERT INTO TRANSACTIONS (account_number, type, amount, description,balance_after)
VALUES (1001, 'WITHDRAW', 1000, 'Initial deposit',5000);

SELECT account_number FROM ACCOUNTS WHERE account_type = 'SAVINGS';
SELECT account_number FROM ACCOUNTS WHERE account_type = 'CURRENT';

SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone_number,
    u.created_at AS user_created_at,

    a.id AS account_id,
    a.account_number,
    a.account_type,
    a.balance AS opening_balance,
    a.is_active,
    a.created_at AS account_created_at,

    t.id AS transaction_id,
    t.type AS transaction_type,
    t.amount,
    t.description,
    t.timestamp AS transaction_time,
    t.balance_after
FROM USERS u
LEFT JOIN ACCOUNTS a ON u.user_id = a.user_id
LEFT JOIN TRANSACTIONS t ON a.account_number = t.account_number
WHERE u.user_id = 1
ORDER BY a.account_number, t.timestamp;


SELECT account_number from ACCOUNTS where user_id=1;

select u.full_name from USERS u left join ACCOUNTS a on u.user_id= a.user_id where u.user_id = 2;

select u.full_name, u.email , u.phone_number , a.account_number, a.account_type from USERS u left join ACCOUNTS a on a.user_id = u.user_id;

select     
a.balance AS opening_balance,
a.is_active,
a.created_at AS account_created_at,

t.type AS transaction_type,
t.amount,
t.description,
t.timestamp AS transaction_time,
t.balance_after

from USERS u join ACCOUNTS a on u.user_id = a.user_id
join TRANSACTIONS t on a.account_number = t.account_number;










