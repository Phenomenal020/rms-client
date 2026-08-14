import { ChatsPanel } from "./chats-panel";
import ChatsLoading from "./loading";

// Chats page — internal messaging between organisation members (local storage for now)
export default function ChatsPage() {
    return (
        <main className="min-h-screen w-full bg-background px-4 py-6 md:px-6 md:py-10">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <ChatsPanel fallback={<ChatsLoading />} />
            </div>
        </main>
    );
}
