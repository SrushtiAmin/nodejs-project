class TodoManagement {
    constructor() {
        this.todos = {}; 
        this.nextId = 1; 
    }

    // Add todo
    async addTodo({ title, description, priority, due_date }) {
        return new Promise((resolve) => {
            if (!title || !description || !priority || !due_date) {
                return resolve({ error: "All fields (title, description, priority, due_date) are required" });
            }

            const validPriorities = ["high", "medium", "low"];
            if (!validPriorities.includes(priority.toLowerCase())) {
                return resolve({ error: "Priority must be low, medium or high" });
            }

            const dueDateObj = new Date(due_date);
            if (isNaN(dueDateObj.getTime())) {
                return resolve({ error: "Invalid due date format" });
            }

            if (dueDateObj < new Date()) {
                return resolve({ error: "Due date cannot be in the past." });
            }

            const todo = {
                id: this.nextId++,
                title,
                description,
                status: "pending",
                priority: priority.toLowerCase(),
                createdAt: new Date().toISOString(),
                due_date,
                completedAt: null,
            };

            this.todos[todo.id] = todo;
            return resolve(todo);
        });
    }

    // List todos
    async listTodos({ status, priority, sortBy } = {}) {
        return new Promise((resolve) => {
            let result = Object.values(this.todos);//return array of values 

            if (status) result = result.filter(todo => todo.status === status);
            if (priority) result = result.filter(todo => todo.priority === priority.toLowerCase());

            if (sortBy === "createdAt") {
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            } else if (sortBy === "due_date") {
                result.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
            } else if (sortBy === "priority") {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            }

            return resolve(result);
        });
    }

    // Update status
    async updateStatus(id, newStatus) {
        return new Promise((resolve) => {
            const todo = this.todos[id];
            if (!todo) return resolve({ error: `Todo with id ${id} is not found.` });

            todo.status = newStatus;
            todo.completedAt = newStatus === "completed" ? new Date().toISOString() : null;

            return resolve(todo);
        });
    }

    // Delete todo
    async deleteTodo(id) {
        return new Promise((resolve) => {
            const todo = this.todos[id];
            if (!todo) return resolve({ error: `Todo with id ${id} is not found.` });

            const removed = this.todos[id];
            delete this.todos[id];
            return resolve(removed);
        });
    }

    // Search
    async searchTodo({ id, query } = {}) {
        return new Promise((resolve) => {
            let result = Object.values(this.todos);

            if (id) result = result.filter(todo => todo.id === id);

            if (query) {
                const q = query.toLowerCase();
                result = result.filter(todo =>
                    (todo.title && todo.title.toLowerCase().includes(q)) ||
                    (todo.description && todo.description.toLowerCase().includes(q))
                );
            }

            return resolve(result.length ? result : { error: "No matching todos found." });
        });
    }
}

// Example usage
(async () => {
    const todoApp = new TodoManagement();

    const newTodo1 = await todoApp.addTodo({
        title: "Learn Node.js",
        description: "Complete Node.js tutorial",
        priority: "high",
        due_date: "2025-10-20T23:59:59Z",
    });

    const newTodo2 = await todoApp.addTodo({
        title: "Learn React.js",
        description: "Complete React.js tutorial",
        priority: "medium",
        due_date: "2025-11-20T23:59:59Z",
    });

    const newTodo3 = await todoApp.addTodo({
        title: "Learn Express.js",
        description: "Complete Express.js tutorial",
        priority: "high",
        due_date: "2025-09-20T23:59:59Z", //past date
    });

    console.log("New Todo Added:", newTodo1);
    console.log("All Todos:", await todoApp.listTodos());

    console.log("High priority:", await todoApp.listTodos({ priority: "high" }));
    console.log("Sorted by due_date:", await todoApp.listTodos({ sortBy: "due_date" }));

    console.log("Update Status (id=2):", await todoApp.updateStatus(2, "completed"));
    console.log("Delete (id=2):", await todoApp.deleteTodo(2));
    console.log("Search by query='express':", await todoApp.searchTodo({ query: "express" }));
})();
