class TodoManagement{
    constructor(){
    this.todos=[]; //empty array to store furhter entries
    this.nextId=1; //increment the index of entry
    }
    //function adding into todo
    addTodo({title, description, priority,due_date
}){
    //create todo
    const todo = {
        id :this.nextId++,// incrementing index
        title,
        description,
        status:"pending", //by default will show pending status
        priority,
        createdAt: new Date().toISOString(), // convert date and time to string object
        due_date,
        completedAt:null, //intially it will be null
    };
    //to add object in array
    this.todos.push(todo);

    //return created todo
    return todo;

    
    }
    //for filtering
    listTodos({ status ,priority,sortBy} ={}){
        let result= [...this.todos]; // copy of original just to make necesarry changes only
        //filter

        if(status){
            result =result.filter(todo =>todo.status === status);//check if status exist and if yes then check that asked status match with the status value 
        }
        if(priority){
            result =result.filter(todo =>todo.priority === priority);
        }

        //sorting
        if(sortBy === "createdAt"){
            result.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
        }else if(sortBy === "due_date"){
            result.sort((a,b)=> new Date(a.due_date) - new Date(b.due_date))
        }else if(sortBy === "priority"){
            const priorityOrder ={"high":1 , "medium":2, "low":3};
            result.sort((a,b)=> priorityOrder[a.priority] - priorityOrder[b.priority])
        }

        return result;

}
        // updating status
        updateStatus(id,newStatus){
            const todo =this.todos.find(t =>t.id===id);

            if(!todo)
                return `todo with ${id} is not found.`;

            todo.status =newStatus;

            if(newStatus=== "completed"){
                todo.completedAt = new Date().toISOString();
            }else{
                todo.completedAt =null;
            }
            return todo;
        }
//deleting todo
        deletetodo(id){
            const index =this.todos.findIndex(todo=>todo.id ===id);//check for the index of exisitng id 
            if(index === -1)
                return `the ${id} not found.`;

            const removed = this.todos.splice(index, 1)[0];
            return removed;

        }

}

const todoApp = new TodoManagement();
//adding todo 
 todoApp.addTodo({
    title:"Learn Node.js",
    description: "Complete Node.js tutorial",
    priority: "high",
    due_date: "2025-10-20T23:59:59Z",

});
todoApp.addTodo({
    title:"Learn Reactjs",
    description: "Complete React.js tutorial",
    priority: "medium",
    due_date: "2025-11-20T23:59:59Z",

});
todoApp.addTodo({
    title:"Learn Expressjs",
    description: "Complete Express.js tutorial",
    priority: "high",
    due_date: "2025-09-20T23:59:59Z",

});

// Print the single created todo
//console.log("New Todo Added:", newTodo);

// //list all todos
// console.log(todoApp.listTodos());

// //filtering todos
// console.log("high priority:", todoApp.listTodos({priority:"high"}));

// //sorting todos
// console.log("sorted by due_date:", todoApp.listTodos({sortBy:"due_date"}));
// console.log("priority:", todoApp.listTodos({sortBy:"priority"}));
// console.log("created date:", todoApp.listTodos({sortBy:"createdAt"}));

//updating status
//todoApp.updateStatus(2,"completed");
//todoApp.updateStatus(4,"completed");

//list all todos
console.log(todoApp.listTodos());

//delete 
console.log(todoApp.deletetodo(3));

//after deletion
console.log(todoApp.listTodos());

//updating id not exisiting
console.log(todoApp.updateStatus(4,"completed"));

