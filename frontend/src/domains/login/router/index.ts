import type { TItcenRoute } from '@/app/types';
import React from 'react';

import LoginPage from '@/domains/login/pages/LoginPage';

const routes: TItcenRoute[] = [
	{
		path: 'login',
		element: React.createElement(LoginPage),
		name: 'login-page/LoginPage',
	},
];

export default routes;