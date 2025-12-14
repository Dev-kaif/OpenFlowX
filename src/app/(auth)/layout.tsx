import Image from "next/image";
import Link from 'next/link';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body>
            <div className='flex justify-center items-center bg-muted min-h-svh max-h-screen flex-col gap-6 p-6 md:p-10'>
                <div className='flex w-full max-w-sm flex-col gap-6'>
                    <Link href={"/"} className='flex items-center gap-2 self-center font-medium'>
                        <Image alt='OpenFlowX' width={30} height={30} src={"/Logos/logo.svg"} />
                        OpenFlowX
                    </Link>
                    {children}
                </div>
            </div>
        </body>
    </html>
  );
}
