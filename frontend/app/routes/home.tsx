import type { Route } from "./+types/home";
import { FileUploader } from "~/components/uploadPage/fileUploader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <FileUploader />;
}
