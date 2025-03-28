import { redirect } from 'next/navigation';

export const metadata = {
  title: 'AI Chat Bot - Anasayfa',
  description: 'Yapay zeka destekli chatbot platformu'
};

export default function Home() {
  redirect('/home');
}
