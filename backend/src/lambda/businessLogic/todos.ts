import * as uuid from 'uuid'

import { TodoItem } from '../../models/TodoItem'
import { TodosRepository } from '../awsRepository/todosRepository'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

const repo = new TodosRepository();

export async function getAllTodosPerUser(userId: string): Promise<TodoItem[]> {
  return repo.getAllTodosPerUser(userId)
}

export async function createTodoItem(
    userId: string,
    createTodoRequest: CreateTodoRequest, 
): Promise<TodoItem> {

  const itemId = uuid.v4()

  const newItem: TodoItem = {
    todoId: itemId,
    userId: userId,
    createdAt: new Date().getTime().toString(),
    done: false,
    ...createTodoRequest
  }

  return await repo.createTodoItem(newItem);
}

export async function deleteTodoItem(
    userId: string,
    itemId: string
  ): Promise<void> {
  
    await repo.deleteTodoItem(userId, itemId);
  }

  export async function updateTodoItem(
    userId: string,
    updateTodoRequest: UpdateTodoRequest, 
    itemId: string
): Promise<TodoItem> {

    const dto = {
        name: updateTodoRequest.name, 
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    }

  return await repo.updateTodoItem(userId, dto, itemId);
}
