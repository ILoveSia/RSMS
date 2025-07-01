import type { TItcenRoute } from '@/app/types';
import React from 'react';

import MainPage from '@/domains/main/pages/MainPage';
import MeetingStatusPage from '@/domains/ledgermngt/pages/MeetingStatusPage';

const routes: TItcenRoute[] = [
  {
    path: 'main',
    element: React.createElement(MainPage),
    name: 'main-page/MainPage',
  },
  {
    path: 'meeting-status',
    element: React.createElement(MeetingStatusPage),
    name: 'meeting-status-page/MeetingStatusPage',
  },
];

export default routes; 