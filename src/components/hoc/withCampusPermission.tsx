import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import type { CampusPermission } from '@/types/campus';

export function withCampusPermission<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	requiredPermission: CampusPermission
) {
	return function WithCampusPermissionWrapper(props: P) {
		const { data: session } = useSession();
		const router = useRouter();
		const [hasPermission, setHasPermission] = useState(false);
		const [isLoading, setIsLoading] = useState(true);

		const { data: userPermissions } = api.campus.getUserPermissions.useQuery(
			undefined,
			{
				enabled: !!session?.user?.id,
			}
		);

		useEffect(() => {
			if (!session) {
				router.push('/auth/signin');
				return;
			}

			if (userPermissions) {
				setHasPermission(userPermissions.includes(requiredPermission));
				setIsLoading(false);
			}
		}, [session, userPermissions, router, requiredPermission]);

		if (isLoading) {
			return <div>Loading...</div>;
		}

		if (!hasPermission) {
			return <div>You do not have permission to access this page.</div>;
		}

		return <WrappedComponent {...props} />;
	};
}