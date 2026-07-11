import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';

/** Entry redirect: send to the app or the login screen. */
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;
  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
