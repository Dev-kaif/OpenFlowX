import { credentialsParamLoader } from '@/features/credentails/params';
import { prefetchCredentails } from '@/features/credentails/server/prefetch';
import { RequiredAuth } from '@/lib/authUtil'
import type { SearchParams } from 'nuqs/server';

type Props = {
  searchParams: Promise<SearchParams>
}

async function page({ searchParams }: Props) {

  await RequiredAuth();

  const props = await credentialsParamLoader(searchParams);

  prefetchCredentails(props);
  return (
    <div>
      cred
    </div>
  )
}

export default page
