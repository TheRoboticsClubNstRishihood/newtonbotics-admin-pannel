'use client';

import { useRouter, usePathname } from 'next/navigation';
import { EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function NewsletterNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isSubscriptionsActive = pathname === '/newsletter';
  const isCampaignsActive = pathname.startsWith('/newsletter/campaigns');

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => router.push('/newsletter')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            isSubscriptionsActive
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <EnvelopeIcon className="h-5 w-5 inline mr-2" />
          Subscriptions
        </button>
        <button
          onClick={() => router.push('/newsletter/campaigns')}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            isCampaignsActive
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <DocumentTextIcon className="h-5 w-5 inline mr-2" />
          Campaigns
        </button>
      </nav>
    </div>
  );
}

