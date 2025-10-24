import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
    return (
        <header className="sticky top-0 z-50 py-1.5 border-b shadow-sm bg-background/80 dark:bg-card backdrop-blur-sm">
            <div className="flex justify-between px-4 max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="flex items-center hover:opacity-90 transition-opacity rounded-md"
                    tabIndex={0}
                    aria-label="Chordium home"
                >
                    <Image
                        src="/favicon-192.png"
                        alt="Chordium logo"
                        width={32}
                        height={32}
                        className="mr-1"
                    />
                    <h1 className="font-semibold text-lg m-0">Chordium</h1>
                </Link>

                <ThemeToggle />
            </div>
        </header>
    )
}