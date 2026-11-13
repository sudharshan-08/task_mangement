import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = cookies();
  const isDemoSession = cookieStore.get('taskflow_demo_session')?.value === 'true';

  if (isDemoSession) {
    redirect('/dashboard');
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect('/dashboard');
    }
  } catch {
    // If Supabase call fails or not configured
  }

  redirect('/login');
}
