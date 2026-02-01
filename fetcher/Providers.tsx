"use client"

import { fetcher } from "./fetcher"
import { SWRConfig } from "swr"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                // refreshInterval: 2000,
                // revalidateOnFocus: false,
                // revalidateOnReconnect: true,
                // revalidateIfStale: false,
            }}
        >
            {children}
        </SWRConfig>
    )
}