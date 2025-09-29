const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

class BankSystem {
    constructor() {
        this.accounts = []; // empty array to store further entries
        this.accountCounter = 1; // increment the index of entry
        this.accountTransaction = 1; // increment once transaction got done

        
    }

    //creating customer acc 
    createAccount(customerName, accountType, initialBalance = 0) {
        // validation of acount 
        //validating customer name
        if (!customerName || typeof customerName !== 'string') {
            console.log("Customer name is invalid");
            return null;
        }
        //validating accountype 
        if (!['saving', 'current'].includes(accountType)) {
            console.log("Invalid Account Type");
            return null;
        }
        //validating balance
        if (initialBalance < 0) {
            console.log("Initial balance can not be negative");
            return null;
        }
        //adding parameters
        const newAccount = {
            accountNumber: this.accountCounter.toString(),
            customerName,
            accountType,
            balance: initialBalance,
            isActive: true,
            createdAt: new Date().toISOString(),
            transactions: []
        }
        if (initialBalance > 0) {
            newAccount.transactions.push({
                id: `TXN${this.accountCounter.toString().padStart(3, '0')}`,
                type: 'deposit',
                amount: initialBalance,
                description: 'Initial Description',
                timestamp: new Date().toISOString(),
                balanceAfter: initialBalance
            });
        }
        this.accounts.push(newAccount)
        console.log(`New Account has been created successfully! Account Number: ${newAccount.accountNumber}`)
        this.accountCounter++;
        return newAccount;
    }

    //deleting account
    deleteAccount(accountNumber) {
        const index = this.accounts.findIndex(acc => acc.accountNumber === accountNumber)
        if (index === -1) {
            console.log("Account not found")
            return false;
        }
        this.accounts[index].isActive = false;
        console.log(`Account ${accountNumber} deleted successfully.`)
        return true;
    }

    // showing account
    showAccount(accountNumber = null) {
        let accountsToShow = this.accounts;
        if (accountNumber) {
            accountsToShow = accountsToShow.filter(a => a.accountNumber === accountNumber);
            if (accountsToShow.length === 0) {
                console.log(`Account ${accountNumber} not found`);
                return;
            }
        }
        accountsToShow.forEach(acc => {
            console.log(`Account Number : ${acc.accountNumber}`);
            console.log(`Customer Name  : ${acc.customerName}`);
            console.log(`Account Type   : ${acc.accountType}`);
            console.log(`Balance        : ₹${acc.balance}`);
            console.log(`Status         : ${acc.isActive ? "Active" : "Inactive"}`);
            console.log(`Created At     : ${acc.createdAt}`);
            console.log(`Total Txns     : ${acc.transactions.length}`);

            if (acc.transactions.length > 0) {
                console.log("\nTransaction History:");
                acc.transactions.forEach(txn => {
                    console.log(
                        `  [${txn.id}] ${txn.type.toUpperCase()} | Amount: ₹${txn.amount} | Balance After: ₹${txn.balanceAfter} | Time: ${txn.timestamp} | Note: ${txn.description}`
                    );
                });
            } else {
                console.log("  No transactions yet.");
            }
        });
    }

    // searching account
    searchAccount({ accountNumber, customerName, includeInactive = false } = {}) {
        let result = [...this.accounts];
        if (accountNumber) {
            result = result.filter(acc => acc.accountNumber === accountNumber.toString());
        }
        if (customerName) {
            result = result.filter(acc => acc.customerName.toLowerCase().includes(customerName.toLowerCase()));
        }
        if (!includeInactive) {
            result = result.filter(acc => acc.isActive === true)
        }
        if (result.length === 0) {
            console.log("Account is not found")
            return [];
        }
        console.log("Search result", result)
        return result;
    }

    //transfering amount
    transferAmount(fromAccountNumber, toAccountNumber, amount) {
        if (fromAccountNumber === toAccountNumber) {
            console.log("Amount cant be tranfer to same account");
            return false;
        }

        const fromAcc = this.accounts.find(acc => acc.accountNumber === fromAccountNumber);
        const toAcc = this.accounts.find(acc => acc.accountNumber === toAccountNumber);

        if (amount <= 0) {
            console.log("amount can not be transferred")
            return false;
        }

        if (!fromAcc) {
            console.log("Source Account is not found");
            return false;
        }
        if (!fromAcc.isActive) {
            console.log("Source Account is inactive");
            return false;
        }

        if (!toAcc) {
            console.log("Destination Account is not found");
            return false;
        }
        if (!toAcc.isActive) {
            console.log("Destination Account is inactive");
            return false;
        }

        if (fromAcc.balance < amount) {
            console.log("Account does not have enough balance");
            return false;
        }

        fromAcc.balance -= amount;
        const txnIdFrom = `TXN${this.accountTransaction.toString().padStart(3, '0')}`;
        this.accountTransaction++;
        const fromTxn = {
            id: txnIdFrom,
            type: 'transfer-out',
            amount,
            description: `Amount transferred to account ${toAccountNumber}`,
            timestamp: new Date().toISOString(),
            balanceAfter: fromAcc.balance
        };
        fromAcc.transactions.push(fromTxn);

        toAcc.balance += amount;
        const txnIdTo = `TXN${this.accountTransaction.toString().padStart(3, '0')}`;
        this.accountTransaction++;
        const toTxn = {
            id: txnIdTo,
            type: 'transfer-in',
            amount,
            description: `Amount has been credited from ${fromAccountNumber}`,
            timestamp: new Date().toISOString(),
            balanceAfter: toAcc.balance
        };
        toAcc.transactions.push(toTxn);

        console.log(`${amount} has been transferred from ${fromAccountNumber} to ${toAccountNumber}`);
        console.log(`Source Account (${fromAcc.accountNumber} - ${fromAcc.customerName}):`);
        console.log(`  ID: ${fromTxn.id} | Type: ${fromTxn.type} | Amount: ₹${fromTxn.amount} | Balance After: ₹${fromTxn.balanceAfter} | Time: ${fromTxn.timestamp}`);
        console.log(`\nDestination Account (${toAcc.accountNumber} - ${toAcc.customerName}):`);
        console.log(`  ID: ${toTxn.id} | Type: ${toTxn.type} | Amount: ₹${toTxn.amount} | Balance After: ₹${toTxn.balanceAfter} | Time: ${toTxn.timestamp}`);

        return true;
    }

    //deposit
    amountDeposit(accountNumber, amount) {
        const acc = this.accounts.find(acc => acc.accountNumber === accountNumber);

        if (!acc) {
            console.log("Account is not there");
            return false;
        }

        if (!acc.isActive) {
            console.log("Account has not been active");
            return false;
        }
        if (amount <= 0) {
            console.log("Deposit amount should be greater than 0")
            return false;
        }

        acc.balance += amount;
        const txnId = `TXN${this.accountTransaction.toString().padStart(3, '0')}`;
        this.accountTransaction++;
        const txn = {
            id: txnId,
            type: 'deposit',
            amount,
            description: 'Amount deposited',
            timestamp: new Date().toISOString(),
            balanceAfter: acc.balance
        };
        acc.transactions.push(txn);

        console.log(`${amount} has been deposited to ${accountNumber}`);
        console.log(`New Balance: ${acc.balance}`)
        return true;
    }

    //withdrawal
    amountWithdraw(accountNumber, amount) {
        const acc = this.accounts.find(acc => acc.accountNumber === accountNumber)

        if (!acc) {
            console.log("Account is not there");
            return false;
        }

        if (!acc.isActive) {
            console.log("Account has not been active");
            return false;
        }
        if (amount <= 0) {
            console.log("withdrawal amount should be greater than 0")
            return false;
        }
        if (acc.balance < amount) {
            console.log("Account does not have sufficient amount")
            return false;
        }

        acc.balance -= amount;
        const txnId = `TXN${this.accountTransaction.toString().padStart(3, '0')}`;
        this.accountTransaction++;
        const txn = {
            id: txnId,
            type: 'Withdraw',
            amount,
            description: 'Amount has been withdrawal',
            timestamp: new Date().toISOString(),
            balanceAfter: acc.balance
        };
        acc.transactions.push(txn);

        console.log(`${amount} has been withdraw from account${accountNumber}`);
        console.log(`New Balance: ${acc.balance}`);
        return true;
    }
}

// --------------------- TEST --------------------- //
const bank = new BankSystem();
const acc1 = console.log(bank.createAccount("John Doe", "saving", 1000));
const acc2 = console.log(bank.createAccount("Srushti Amin", "current", 1000));

bank.showAccount();
bank.searchAccount({ accountNumber: "2" });
bank.searchAccount({ accountNumber: "1" });
bank.transferAmount("1", "2", 300);
bank.showAccount();
bank.amountDeposit("1", 500);
bank.showAccount();
bank.amountWithdraw("2", 900);
bank.showAccount();
