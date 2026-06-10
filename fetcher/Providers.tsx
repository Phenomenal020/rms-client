"use client"

import { fetcher } from "./fetcher"
import { SWRConfig } from "swr"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                // Default SWR retries failed requests up to 5 times — cap retries to limit noise and load on bad endpoints.
                // errorRetryCount: 1,
                // errorRetryInterval: 15_000,
                refreshInterval: 15000,
                // revalidateOnFocus: false,
                // revalidateOnReconnect: true,
                // revalidateIfStale: false,
            }}
        >
            {children}
        </SWRConfig>
    )
}