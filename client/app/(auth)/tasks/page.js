'use client';
import { use } from 'react';
import TasksView from '../../../components/TasksView';

export default function TasksPage({ searchParams }) {
  // Unwrap searchParams Promise for Next.js 15+
  const resolvedParams = typeof searchParams === 'object' && searchParams !== null && 'then' in searchParams 
    ? use(searchParams) 
    : searchParams;
    
  return <TasksView initialFilters={resolvedParams} />;
}
