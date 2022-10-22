const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  
  const foundAccount = users.find(users => users.username === username)

  if(!foundAccount) {
    return response.status(400).send("Username not found")
  }

  request.user = foundAccount;
  request.username = foundAccount.username

  next();
  
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const usernameAlreadyExists = users.find(users => users.username === username);
  
  if(usernameAlreadyExists){
    return response.status(400).json({error: "Username already exists"})
  } else {
    users.push(newUser)
    return response.status(200).json(newUser)
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request

    return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {title, deadline} = request.body;

    const {user} = request;

    const newTodo = { 
      id: uuidv4(), // precisa ser um uuid
      title,
      done: false, 
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(newTodo);

    return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;

  const {user} = request;

  const todoExists = user.todos.find(todo => todo.id === id);

  if(todoExists){
    user.todos.forEach(todo => {
      if(todo.id === id){      
        todo.title = title;
        todo.deadline = deadline;
      }
      return {...todo}
    });
  
    return response.status(201).json(todoExists)    
  } else {
    return response.status(404).json({error: "Todo doesn't exist."})
  }



});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todoExists = user.todos.find(todo => todo.id === id);

  if(todoExists){
    user.todos.forEach(todo => {
      if(todo.id === id){
        todo.done = true;
      }
    });
    return response.status(201).json(todoExists)
  } else {
    return response.status(404).json({error: "Todo doesn't exist."})
  }


});

app.delete('/todos/:id', checksExistsUserAccount,  (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todoToDelete = user.todos.findIndex(todo => todo.id === id);
  
  if(todoToDelete >= 0) {
    user.todos.splice(todoToDelete, 1);
    return response.status(204).send("Todo deleted")    
  } else {
    return response.status(404).json({error: "Todo doesn't exist."})
  }

});

module.exports = app;