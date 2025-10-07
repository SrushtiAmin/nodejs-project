const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

class BankSystem {
    constructor() {
        this.accounts = {}; // using object instead of array
        this.accountCounter = 1;
        this.accountTransaction = 1;

        // Initialize DB connection
        (async () => {
            await this.initDB();
        })();
    }

    async initDB() {
        this.db = await open({
            filename: './bank.db',
            driver: sqlite3.Database
        });
        console.log("DB Connected Successfully!");
    }

    // Helper for input validation
    validateAccountInput(customerName, accountType, initialBalance) {
        const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT'];

        if (!customerName || typeof customerName !== 'string') {
            return { error: "Customer name is invalid" };
        }
        if (!ACCOUNT_TYPES.includes(accountType.toUpperCase())) {
            return { error: "Invalid Account Type" };
        }
        if (initialBalance < 0) {
            return { error: "Initial balance cannot be negative" };
        }
        return null;
    }

    async createAccount(customerName, accountType, initialBalance = 0) {
        const validationError = this.validateAccountInput(customerName, accountType, initialBalance);
        if (validationError) return validationError;

        const accNumber = this.accountCounter.toString();
        const newAccount = {
            accountNumber: accNumber,
            customerName,
            accountType: accountType.toUpperCase(),
            balance: initialBalance,
            isActive: true,
            createdAt: new Date().toISOString(),
            transactions: []
        };

        if (initialBalance > 0) {
            newAccount.transactions.push({
                id: `TXN${this.accountTransaction.toString().padStart(3, '0')}`,
                type: 'DEPOSIT',
                amount: initialBalance,
                description: 'Initial deposit',
                timestamp: new Date().toISOString(),
                balanceAfter: initialBalance
            });
            this.accountTransaction++;
        }

        this.accounts[accNumber] = newAccount;
        this.accountCounter++;

        return newAccount;
    }

    async deleteAccount(accountNumber) {
        const account = this.accounts[accountNumber];
        if (!account) return { error: "Account not found" };

        account.isActive = false;
        return account;
    }

    async showAccount(accountNumber = null) {
        const accountsToShow = accountNumber ? [this.accounts[accountNumber]] : Object.values(this.accounts);

        if (!accountsToShow || accountsToShow.length === 0) return { error: "Account not found" };

        return accountsToShow;
    }

    async searchAccount({ accountNumber, customerName, includeInactive = false } = {}) {
        let result = Object.values(this.accounts);

        if (accountNumber) result = result.filter(acc => acc.accountNumber === accountNumber.toString());
        if (customerName) result = result.filter(acc => acc.customerName.toLowerCase().includes(customerName.toLowerCase()));
        if (!includeInactive) result = result.filter(acc => acc.isActive);

        if (result.length === 0) return { error: "No matching accounts found" };
        return result;
    }

    async processTransaction(account, type, amount, description) {
        if (!account) return { error: "Account not found" };
        if (!account.isActive) return { error: "Account is inactive" };
        if (amount <= 0) return { error: "Amount must be greater than 0" };

        if (type === 'WITHDRAW' && account.balance < amount) {
            return { error: "Insufficient balance" };
        }

        if (type === 'DEPOSIT') {
            account.balance += amount;
        } else if (type === 'WITHDRAW') {
            account.balance -= amount;
        }

        const txn = {
            id: `TXN${this.accountTransaction.toString().padStart(3, '0')}`,
            type,
            amount,
            description,
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance
        };
        account.transactions.push(txn);
        this.accountTransaction++;

        return txn;
    }

    async deposit(accountNumber, amount) {
        const account = this.accounts[accountNumber];
        return await this.processTransaction(account, 'DEPOSIT', amount, 'Deposit');
    }

    async withdraw(accountNumber, amount) {
        const account = this.accounts[accountNumber];
        return await this.processTransaction(account, 'WITHDRAW', amount, 'Withdrawal');
    }

    async transfer(fromAccountNumber, toAccountNumber, amount) {
        if (fromAccountNumber === toAccountNumber) return { error: "Cannot transfer to same account" };

        const fromAcc = this.accounts[fromAccountNumber];
        const toAcc = this.accounts[toAccountNumber];

        if (!fromAcc || !toAcc) return { error: "Source or destination account not found" };

        const withdrawResult = await this.processTransaction(fromAcc, 'TRANSFER-OUT', amount, `Transfer to ${toAccountNumber}`);
        if (withdrawResult.error) return withdrawResult;

        const depositResult = await this.processTransaction(toAcc, 'TRANSFER-IN', amount, `Transfer from ${fromAccountNumber}`);
        return { withdraw: withdrawResult, deposit: depositResult };
    }
}

// Example usage
(async () => {
    const bank = new BankSystem();

    const acc1 = await bank.createAccount("John Doe", "SAVINGS", 1000);
    const acc2 = await bank.createAccount("Srushti Amin", "CURRENT", 1000);

    console.log(await bank.showAccount());
    console.log(await bank.deposit(acc1.accountNumber, 500));
    console.log(await bank.withdraw(acc2.accountNumber, 200));
    console.log(await bank.transfer(acc1.accountNumber, acc2.accountNumber, 300));
    console.log(await bank.showAccount());
})();
