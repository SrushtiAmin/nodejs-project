class BankSystem{
    constructor(){
    this.accounts=[]; //empty array to store further entries
    this.accountCounter=1; //increment the index of entry
    }

//creating customer acc 
    createAccount(customerName,accountType,initialBalance=0){
    // validation of acount 
        //validating customer name
        if(!customerName || typeof customerName !== 'string'){
            console.log("Customer name is invalid");
            return null;
        }
        //validating accountype 
        if(!['saving','current'].includes(accountType)){
            console.log("Invalid Account Type");
            return null;
        }
        //validating balance
        if(initialBalance<0){
            console.log("Initial balance can not be negative");
            return null;
        }
        //adding parameters
            const newAccount ={
            accountNumber: this.accountCounter.toString(),// string representation of object , store id as a string
            customerName,
            accountType,
            balance: initialBalance,
            isActive: true,
            createdAt: new Date().toISOString(),
            transactions:[]
        }
        if(initialBalance >0){
            newAccount.transactions.push({
                id:`TXN${this.accountCounter.toString().padStart(3,'0')}`,
                type:'deposit',
                amount:initialBalance,
                description:'Initial Description',
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
    deleteAccount(accountNumber){
        const index = this.accounts.findIndex(acc=>acc.accountNumber === accountNumber)
        if(index === -1){
            console.log("Account not found")
            return false;
        }
        //soft acc deleting ,will remain in memory but appear as non active
        this.accounts[index].isActive =false;// setting accountnumber value to be false to delete it 
        console.log(`Account ${accountNumber} deleted successfully.`)
        return true;
    }
    // showing account
    showAccount(){
        console.log(this.accounts)
    }
    // searching account by account number and customer name 
    searchAccount({accountNumber,customerName,includeInactive =false} ={}){
        let result =[...this.accounts];

        if(accountNumber){
            result =result.filter(acc =>acc.accountNumber===accountNumber.toString());
        }
        if(customerName){
            result =result.filter( acc=>acc.customerName.toLowerCase().includes(customerName.toLowerCase()));   
            
        }
        if(!includeInactive){
            result=result.filter(acc=> acc.isActive=== true)
        }
        if(result.length === 0){
            console.log("Account is not found")
            return [];
        }
        console.log("Search result", result)
        return result;
    }
    //transfering amount from one account to another 
    transferAmount(fromaccountNumber , to){

    }

}
const bank =new BankSystem();
//adding
const acc1 = console.log(bank.createAccount("John Doe", "saving",1000));
const acc2 = console.log(bank.createAccount("Srushti Amin", "current",1000));
//deleting
bank.deleteAccount("2");//must given as string
//showing accounts
bank.showAccount();
//searching account
bank.searchAccount({accountNumber: "2"})
bank.searchAccount({accountNumber: "1"})

