import { redirect } from "next/navigation";

/** The AI assistant has been removed. Old links go to the dashboard. */
export default function AssistantPage() {
  redirect("/dashboard");
}
