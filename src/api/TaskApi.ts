import BaseApi from './BaseApi'
import type { Task } from '@/types'
import { mockTasks } from '@/mock/tasks'

class TaskApi extends BaseApi {
  getTasks(): Promise<Task[]> {
    return this.get<Task[]>('/mock/api/tasks', this.withMockAdapter(this.mockAdapter(mockTasks)))
  }

  saveTask(task: Task): Promise<Task> {
    return this.post<Task, Task>(
      '/mock/api/tasks',
      task,
      this.withMockAdapter(this.mockAdapter(task, 300)),
    )
  }
}

export const taskApi = new TaskApi()
