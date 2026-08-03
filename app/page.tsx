import type { Metadata } from "next";
import { MidenLab } from "./MidenLab";

export const metadata: Metadata = {
  title: "Miden Private Notes Lab",
  description:
    "An interactive developer lab for private notes and client-side proving on Miden.",
};

export default function Home() {
  return <MidenLab />;
}
