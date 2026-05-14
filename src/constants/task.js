export const TASK_STATUS = {
  pending: { label: '待处理', className: 'status--pending' },
  in_progress: { label: '进行中', className: 'status--in-progress' },
  completed: { label: '已完成', className: 'status--completed' },
};

export const TASK_STATUS_OPTIONS = ['pending', 'in_progress', 'completed'];

export function getTaskStatusLabel(status) {
  return TASK_STATUS[status]?.label || status;
}

export const TASK_PRIORITY = {
  high: { label: '高', className: 'priority--high' },
  medium: { label: '中', className: 'priority--medium' },
  low: { label: '低', className: 'priority--low' },
};

export function getTaskPriorityInfo(priority) {
  return TASK_PRIORITY[priority] || TASK_PRIORITY.medium;
}
