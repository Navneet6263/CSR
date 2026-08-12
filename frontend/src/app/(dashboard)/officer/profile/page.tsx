import { TopNav } from '@/components/officer/TopNav';
import AccountProfile from '@/components/shared/AccountProfile';
export default function Page() { return <div className="flex min-h-screen flex-col"><TopNav /><main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8"><AccountProfile title="Field Officer Profile" /></main></div>; }
