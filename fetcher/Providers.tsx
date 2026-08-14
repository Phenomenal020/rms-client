"use client"

import { fetcher } from "./fetcher"
import { SWRConfig } from "swr"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher, // fetcher function to fetch data from the API
                // Default SWR retries failed requests up to 5 times — cap retries to limit noise and load on bad endpoints.
                // errorRetryCount: 3, // 3 retries for failed requests. Uses exponential backoff
                // errorRetryInterval: 15_000, // 15 seconds between retries (matches the api's timeout setting)
                refreshInterval: 0,  // disable automatic refreshing / polling
                revalidateOnFocus: false, // disable revalidation when the window regains focus
                revalidateOnReconnect: true, // revalidate when the network reconnects
                // revalidateIfStale: false,
            }}
        >
            {children}
        </SWRConfig>
    )
}