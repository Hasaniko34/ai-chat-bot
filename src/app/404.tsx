import { redirect } from 'next/navigation';

export default function OldNotFound() {
  redirect('/not-found');
} 