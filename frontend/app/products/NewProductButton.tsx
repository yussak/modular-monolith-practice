"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NewProductButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      alert("ログインしてください");
      return;
    }
    router.push("/products/new");
  };

  return <button onClick={handleClick}>新規作成</button>;
}
