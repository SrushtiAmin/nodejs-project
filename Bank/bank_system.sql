-- ----------------- USERS TABLE -----------------
CREATE TABLE IF NOT EXISTS USERS (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number VARCHAR(10),
    created_at TEXT DEFAULT (DATETIME('NOW'))
);

-- ----------------- ACCOUNTS TABLE -----------------
CREATE TABLE IF NOT EXISTS ACCOUNTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_number INTEGER UNIQUE NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('SAVINGS', 'CURRENT')),
    balance REAL NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (DATETIME('NOW')),
    FOREIGN KEY(user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- Create index for frequent lookups
CREATE INDEX IF NOT EXISTS idx_account_number ON ACCOUNTS(account_number);

-- ----------------- TRANSACTIONS TABLE -----------------
CREATE TABLE IF NOT EXISTS TRANSACTIONS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_number INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('DEPOSIT', 'WITHDRAW', 'TRANSFER-IN', 'TRANSFER-OUT')),
    amount REAL NOT NULL,
    description TEXT,
    timestamp TEXT DEFAULT (DATETIME('NOW')),
    balance_after REAL NOT NULL,
    FOREIGN KEY(account_number) REFERENCES ACCOUNTS(account_number) ON DELETE CASCADE
);

-- Create index for faster transaction queries
CREATE INDEX IF NOT EXISTS idx_txn_account_number ON TRANSACTIONS(account_number);

-- ----------------- SAMPLE DATA -----------------
INSERT INTO USERS (full_name, email, phone_number) VALUES 
('Srushti Amin', 'srushtiamin@gmail.com', '9173480640'),
('John Doe', 'john@gmail.com', '1234567890');

INSERT INTO ACCOUNTS (user_id, account_number, account_type, balance) VALUES
(1, 1001, 'SAVINGS', 5000),
(1, 1002, 'CURRENT', 5000),
(2, 1003, 'SAVINGS', 1000);

INSERT INTO TRANSACTIONS (account_number, type, amount, description, balance_after) VALUES
(1001, 'DEPOSIT', 5000, 'Initial Deposit', 5000),
(1003, 'DEPOSIT', 1000, 'Initial Deposit', 1000);

-- All users
SELECT * FROM USERS;

-- All accounts
SELECT * FROM ACCOUNTS;

-- All transactions
SELECT * FROM TRANSACTIONS;
-- Accounts for a specific user
SELECT * FROM ACCOUNTS WHERE user_id = 1;

-- Specific user by ID
SELECT * FROM USERS WHERE user_id = 1;

-- Specific account by account number
SELECT * FROM ACCOUNTS WHERE account_number = 1001;

-- Transactions for a specific account
SELECT * FROM TRANSACTIONS WHERE account_number = 1001;
-- Accounts of a specific type
SELECT account_number FROM ACCOUNTS WHERE account_type = 'SAVINGS';
SELECT account_number FROM ACCOUNTS WHERE account_type = 'CURRENT';

-- Active accounts only
SELECT * FROM ACCOUNTS WHERE is_active = 1;

-- Inactive accounts
SELECT * FROM ACCOUNTS WHERE is_active = 0;
-- Join users with their accounts
SELECT 
    u.full_name, u.email, u.phone_number, u.created_at AS user_created_at,
    a.account_number, a.account_type, a.balance, a.is_active, a.created_at AS account_created_at
FROM USERS u
LEFT JOIN ACCOUNTS a ON a.user_id = u.user_id;

-- Join users, accounts, and transactions
SELECT 
    u.user_id, u.full_name, u.email, u.phone_number, u.created_at AS user_created_at,
    a.id AS account_id, a.account_number, a.account_type, a.balance AS opening_balance, a.is_active, a.created_at AS account_created_at,
    t.id AS transaction_id, t.type AS transaction_type, t.amount, t.description, t.timestamp AS transaction_time, t.balance_after
FROM USERS u
LEFT JOIN ACCOUNTS a ON u.user_id = a.user_id
LEFT JOIN TRANSACTIONS t ON a.account_number = t.account_number
ORDER BY a.account_number, t.timestamp;

-- Join users and accounts for a specific user
SELECT u.full_name, u.email, u.phone_number, a.account_number, a.account_type
FROM USERS u
LEFT JOIN ACCOUNTS a ON a.user_id = u.user_id
WHERE u.user_id = 2;
-- Total balance per user
SELECT u.user_id, u.full_name, SUM(a.balance) AS total_balance
FROM USERS u
JOIN ACCOUNTS a ON u.user_id = a.user_id
GROUP BY u.user_id;

-- Total transactions per account
SELECT account_number, COUNT(*) AS total_transactions
FROM TRANSACTIONS
GROUP BY account_number;

-- Total deposits per account
SELECT account_number, SUM(amount) AS total_deposit
FROM TRANSACTIONS
WHERE type = 'DEPOSIT'
GROUP BY account_number;
-- Index on account_number in ACCOUNTS (frequently queried)
CREATE INDEX IF NOT EXISTS idx_account_number ON ACCOUNTS(account_number);

-- Index on account_number in TRANSACTIONS (for joins and lookups)
CREATE INDEX IF NOT EXISTS idx_txn_account_number ON TRANSACTIONS(account_number);

-- Index on user_id in ACCOUNTS (for user-account joins)
CREATE INDEX IF NOT EXISTS idx_user_id ON ACCOUNTS(user_id);
