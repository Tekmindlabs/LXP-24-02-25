import { headers } from "next/headers";
import { createTRPCProxyClient, loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { type AppRouter } from "@/server/api/root";

export const api = createTRPCProxyClient<AppRouter>({
	links: [
		loggerLink({
			enabled: (opts) =>
				process.env.NODE_ENV === "development" ||
				(opts.direction === "down" && opts.result instanceof Error),
		}),
		unstable_httpBatchStreamLink({
			url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`,
			async headers() {
				const headersList = await headers();
				const entries = Array.from(headersList.entries());
				return {
					...Object.fromEntries(entries),
					"x-trpc-source": "rsc",
				};
			},
		}),
	],
});