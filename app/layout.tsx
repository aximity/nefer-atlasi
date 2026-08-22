import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"İKV Eşya Rehberi",description:"İKV eşyalarını, görünüş ailelerini, efsun varyantlarını ve düşme kaynaklarını keşfet.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
