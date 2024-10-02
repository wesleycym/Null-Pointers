import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'CSE 312 Project',
	description: 'CSE 312 Project',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${inter.className} antialiased dark:dark`}>
				<div className='flex flex-col items-center justify-center h-screen'>
					{children}
				</div>
			</body>
		</html>
	);
}
