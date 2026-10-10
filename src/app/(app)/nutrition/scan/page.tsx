import { redirect } from "next/navigation";

/** Food photo analysis has been removed. Old links go to the nutrition page. */
export default function FoodScanPage() {
  redirect("/nutrition");
}
